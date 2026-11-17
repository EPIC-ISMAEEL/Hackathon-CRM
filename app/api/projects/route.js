import {getUser} from '@/lib/auth';
import {projectsFor} from '@/lib/data';
export const dynamic='force-dynamic';
export async function GET(){
 const u=await getUser();if(!u)return Response.json({error:'Unauthorized'},{status:401});
 return Response.json({projects:await projectsFor(u)});
}
