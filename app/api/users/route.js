import {getDb} from '@/lib/db';
import {getUser} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(){
 if(!await getUser())return Response.json({error:'Unauthorized'},{status:401});
 const users=await(await getDb()).collection('users').find({},{projection:{_id:0,passwordHash:0,email:0}}).toArray();
 return Response.json({users});
}
