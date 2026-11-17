import {getDb} from './db';
// Role-based access: ADMIN all, MANAGER own projects, AGENT projects with their tasks (only their tasks).
export async function projectsFor(user){
 const db=await getDb();let pf={},tf={};
 if(user.role==='MANAGER')pf={managerId:user.id};
 if(user.role==='AGENT'){pf={id:{$in:await db.collection('tasks').distinct('projectId',{assigneeId:user.id})}};tf={assigneeId:user.id}}
 const projects=await db.collection('projects').find(pf,{projection:{_id:0}}).sort({deadline:1,name:1}).toArray();
 const tasks=await db.collection('tasks').find({...tf,projectId:{$in:projects.map(p=>p.id)}},{projection:{_id:0}}).sort({deadline:1}).toArray();
 return projects.map(p=>({...p,tasks:tasks.filter(t=>t.projectId===p.id)}));
}
export const projectFor=async(user,id)=>(await projectsFor(user)).find(p=>p.id===id)||null;
