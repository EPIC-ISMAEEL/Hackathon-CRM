import {SignJWT,jwtVerify} from 'jose';
import {cookies} from 'next/headers';
import {getDb} from './db';
const key=()=>new TextEncoder().encode(process.env.AUTH_SECRET);
export async function setSession(id){
 const t=await new SignJWT({}).setSubject(id).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(key());
 (await cookies()).set('j4_session',t,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:604800});
}
export const clearSession=async()=>(await cookies()).delete('j4_session');
// Current user always comes from the signed session cookie (role re-read from DB).
export async function getUser(){
 const t=(await cookies()).get('j4_session')?.value;if(!t)return null;
 try{const{payload}=await jwtVerify(t,key());return await(await getDb()).collection('users').findOne({id:payload.sub},{projection:{_id:0,passwordHash:0}})}catch{return null}
}
