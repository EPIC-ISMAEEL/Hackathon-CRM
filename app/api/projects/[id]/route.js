import {getUser} from '@/lib/auth';
import {projectFor} from '@/lib/data';
export const dynamic='force-dynamic';
export async function GET(_,{params}){
 const u=await getUser();if(!u)return Response.json({error:'Unauthorized'},{status:401});
 const{ id }=await params;
 const p=await projectFor(u,id);
 return p?Response.json({project:p}):Response.json({error:'Project not found or access denied'},{status:403});
}
