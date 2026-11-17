import {getDb,getClient} from '@/lib/db';
import {getUser} from '@/lib/auth';
import {extract} from '@/lib/ai';
import {validate,build} from '@/lib/validate';
export const dynamic='force-dynamic';
export const maxDuration=60;
const J=(d,s=200)=>Response.json(d,{status:s});
export async function POST(req){
 const user=await getUser();
 if(!user)return J({error:'Unauthorized'},401);
 if(user.role!=='ADMIN')return J({error:'Only the administrator can create from a transcript'},403);
 const{transcript,draft:given,replace}=await req.json().catch(()=>({}));
 const db=await getDb(),users=await db.collection('users').find({},{projection:{_id:0,passwordHash:0,email:0}}).toArray();
 let draft=given;
 if(!draft){
  if(!transcript?.trim())return J({error:'Transcript is empty. Paste a meeting transcript first.'},400);
  try{draft=await extract(transcript,users)}catch(e){return J({error:e.message},502)}
 }
 const issues=validate(draft,users);
 if(issues.length)return J({error:'Some required fields are unresolved. Nothing was saved.',issues,draft},422);
 const{projects,tasks}=build(draft),client=await getClient(),s=client.startSession();
 try{
  await s.withTransaction(async()=>{
   if(replace){await db.collection('projects').deleteMany({},{session:s});await db.collection('tasks').deleteMany({},{session:s})}
   await db.collection('projects').insertMany(projects,{session:s});
   if(tasks.length)await db.collection('tasks').insertMany(tasks,{session:s});
  });
 }catch(e){return J({error:'Save failed; nothing was created. '+e.message},500)}finally{await s.endSession()}
 return J({created:projects.map(p=>({name:p.name,tasks:tasks.filter(t=>t.projectId===p.id).length}))});
}
