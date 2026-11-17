import bcrypt from 'bcryptjs';
import {getDb} from '@/lib/db';
import {getUser,setSession,clearSession} from '@/lib/auth';
export const dynamic='force-dynamic';
const J=(d,s=200)=>Response.json(d,{status:s});
export const GET=async()=>J({user:await getUser()});
export async function POST(req){
 const{email,password}=await req.json().catch(()=>({}));
 const u=email&&password&&await(await getDb()).collection('users').findOne({email:String(email).trim().toLowerCase()});
 if(!u||!await bcrypt.compare(String(password),u.passwordHash))return J({error:'Invalid email or password'},401);
 await setSession(u.id);const{_id,passwordHash,...user}=u;return J({user});
}
export const DELETE=async()=>{await clearSession();return J({ok:true})};
