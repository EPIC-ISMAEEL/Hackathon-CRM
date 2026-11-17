const SYS=`You convert meeting transcripts into project-management records for NovaWorks Technologies. Return ONLY JSON in this shape:
{"projects":[{"name":"","clientName":"","description":"","managerId":"","deadline":"YYYY-MM-DD","tasks":[{"title":"","description":"","assigneeId":"","deadline":"YYYY-MM-DD","estimatedHours":0}]}]}
Rules:
1. One project per client engagement; keep separate projects separate.
2. Use FINAL agreed decisions only: later corrections and the final recap override earlier values (deadlines, hours, owners, names).
3. Ignore rejected, excluded or future-work features; create no tasks for them.
4. managerId must be the id of a MANAGER from the directory; assigneeId the id of an AGENT from the directory. Never invent people. Anyone not in the directory (client contacts, end users) is never a manager or assignee.
5. estimatedHours = developer effort in hours (a number), not calendar days; no management hours.
6. Dates are YYYY-MM-DD (year 2026 unless stated); resolve relative dates from the meeting date in the transcript.
7. A task deadline must not be later than its project deadline.
8. One owner per task; do not split or merge tasks beyond what was agreed. Project description states the scope and what is excluded; task description states its scope.
9. If a required value cannot be determined, use null instead of guessing.`;
export async function extract(transcript,users){
 const dir=users.map(({id,name,role,specialization,skills})=>({id,name,role,specialization,skills}));
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
 const body=JSON.stringify({systemInstruction:{parts:[{text:SYS+'\nDIRECTORY:\n'+JSON.stringify(dir)}]},contents:[{role:'user',parts:[{text:transcript}]}],generationConfig:{responseMimeType:'application/json',temperature:0}});
 for(let i=0;;i++){
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body});
  if(r.ok){
   const t=(await r.json()).candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
   try{return JSON.parse(t.replace(/^```(?:json)?|```$/g,'').trim())}catch{throw new Error('AI returned invalid JSON. Please try again.')}
  }
  if(i>=2||![429,500,503].includes(r.status))throw new Error(`AI request failed (${r.status}). Please try again.`);
  await new Promise(s=>setTimeout(s,1500*(i+1)));
 }
}
