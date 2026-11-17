import bcrypt from 'bcryptjs';
const U=(id,name,role,specialization,skills)=>({id,name,email:`${name.split(' ')[0].toLowerCase()}@novaworks.example`,role,specialization,skills});
export const USERS=[
{...U('ADMIN','Admin','ADMIN','Administrator',['Company overview','Transcript creation']),email:'admin@novaworks.example'},
U('PM01','Ayesha Khan','MANAGER','Web PM',['Web projects','Client coordination']),
U('PM02','Bilal Ahmed','MANAGER','Mobile PM',['Mobile projects','Delivery planning']),
U('PM03','Hina Malik','MANAGER','AI PM',['AI projects','Requirement review']),
U('DEV01','Ali Raza','AGENT','Full-Stack',['React','Frontend integration']),
U('DEV02','Hamza Shah','AGENT','Full-Stack',['Node.js','Databases','APIs']),
U('DEV03','Sara Noor','AGENT','App Developer',['Flutter','Mobile UI']),
U('DEV04','Usman Tariq','AGENT','App Developer',['Flutter','Integration','Testing']),
U('DEV05','Zain Abbas','AGENT','AI Developer',['LLMs','Extraction','Prompts']),
U('DEV06','Maryam Asif','AGENT','AI Developer',['Retrieval','Document processing'])];
// Idempotent: inserts only missing users (by email); never duplicates.
export async function seedUsers(db){
 const c=db.collection('users');
 await Promise.all([c.createIndex({email:1},{unique:true}),c.createIndex({id:1},{unique:true}),db.collection('tasks').createIndex({assigneeId:1}),db.collection('tasks').createIndex({projectId:1}),db.collection('projects').createIndex({managerId:1})]);
 const have=new Set((await c.find({},{projection:{email:1}}).toArray()).map(u=>u.email));
 const todo=USERS.filter(u=>!have.has(u.email));
 if(!todo.length)return 0;
 const passwordHash=await bcrypt.hash('Demo123!',10);
 try{await c.insertMany(todo.map(u=>({...u,passwordHash})),{ordered:false})}catch(e){if(e.code!==11000&&!e.writeErrors)throw e}
 return todo.length;
}
