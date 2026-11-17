import bcrypt from 'bcryptjs';
import {randomUUID} from 'node:crypto';
import {getDb} from '@/lib/db';
import {setSession} from '@/lib/auth';

export const dynamic='force-dynamic';
const J=(d,s=200)=>Response.json(d,{status:s});

export async function POST(req){
 const body=await req.json().catch(()=>null);
 if(!body||typeof body!=='object'||Array.isArray(body))return J({error:'Invalid request body'},400);

 const name=typeof body.name==='string'?body.name.trim():'';
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 const password=typeof body.password==='string'?body.password:'';
 if(!name||name.length>80)return J({error:'Name is required and must be 80 characters or fewer'},400);
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return J({error:'Enter a valid email address'},400);
 if(password.length<8||Buffer.byteLength(password,'utf8')>72)return J({error:'Password must be at least 8 characters and no more than 72 bytes'},400);

 const db=await getDb(),users=db.collection('users');
 const existing=await users.findOne({email},{projection:{_id:1}});
 if(existing)return J({error:'An account with this email already exists'},409);

 const user={id:randomUUID(),name,email,role:'AGENT',specialization:'General',skills:[]};
 try{
  await users.insertOne({...user,passwordHash:await bcrypt.hash(password,12)});
 }catch(error){
  if(error.code===11000)return J({error:'An account with this email already exists'},409);
  throw error;
 }
 await setSession(user.id);
 return J({user},201);
}
