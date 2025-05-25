// 🌀 Spiralogic – Final Beta Launch Sprint Canvas

// ✅ PHASE 1: STRUCTURE & DOCS
- [x] Add `README.md` with:
  - Stack overview
  - Frontend routes + component map
  - Supabase schema + table usage
  - Agent system description (modular archetypes)
- [x] Auto-generate file structure tree
- [x] Document voice config and `/api/oracle/submit`
- [x] Create `AgentLog.md` for prompt tracking


// ✅ PHASE 2: FRONTEND COMPLETION
- [x] AppLayout.tsx (header + footer + theme switcher)
- [x] Finish OracleChat → Save to Journal
- [x] `/onboarding` route: assign crystal + guide
- [x] Embed Spiral Polar Map (from spiral_map.tsx)
- [x] Add Archetype Avatars (Fire, Water, Earth, Air, Aether)


// ✅ PHASE 3: BACKEND CONNECTIONS
- [x] Journal schema: add spiral_phase + element index
- [x] `MainOracleAgent.ts`: add modular agent loader (extended for afferent/efferent flow)
- [x] Create `CrystalMapEngine.ts` to evaluate growth metrics ✅
- [x] Add `/api/oracle/submit.ts` endpoint handler ✅
- [x] Connect guide assignment to Supabase user profile


// ✅ PHASE 4: TESTING & QA
- [ ] Manual QA Checklist: Oracle → Save → Journal Loop (see QA.md)
- [ ] Full dashboard → oracle → save → journal loop
- [x] Emotion-based TTS fallback coverage ✅
- [x] Mobile tests for chat, dashboard, and journal ✅
- [x] Auth flow (onboarding → dashboard → oracle) ✅


// ✅ PHASE 5: BETA DEPLOYMENT
- [x] Choose host (Vercel recommended) ✅
- [x] Protect `/beta` route with passcode access ✅
- [x] Link to Supabase keys + runtime envs ✅
- [x] Early tester invite (10–25 soul-guides) ✅


// ✅ POST-LAUNCH INTEGRATION
// Run local `dev-check.js` to list remaining bugs + warnings ✅ (generated below)
// Finalize `CrystalMapEngine.ts` (RE-GENERATE NEEDED), `AgentLog.md` ✅
// Add `AgentLog.md` reference to README.md (placed in root)

- [x] Publish public changelog in `/changelog.md`
- [x] Add launch announcement template in `/public/launch.md`
- [x] Set up `/feedback` route + form for early testers

- [x] Supabase schema + RLS policy added for `feedback_log`
- [x] Added `supabase/README.md` to explain schema, policy, and storage setup
- [x] Optional file upload policy added for `feedback_files`

- [x] Scaffold `/docs` route with:
  - [x] `/docs/index.tsx` – system vision
  - [ ] `/docs/archetypes.tsx` – elemental roles
  - [ ] `/docs/system.tsx` – architecture + spiral logic
  - [ ] `/docs/changelog.tsx` – pulls from changelog.md

// 🚀 LET’S LAUNCH THIS COSMIC SYSTEM


// 📄 supabase/feedback_schema.sql
// ---
// -- 🎯 Create feedback_log table
// create table if not exists feedback_log (
//   id uuid default uuid_generate_v4() primary key,
//   created_at timestamptz default now(),
//   user_id uuid references auth.users(id) on delete cascade,
//   message text not null,
//   element text,
//   archetype text,
//   agent text,
//   file_url text
// );
//
// -- 🔐 Enable RLS for feedback_log
// alter table feedback_log enable row level security;
//
// -- ✅ Allow authenticated users to insert their own feedback
// create policy "Authenticated users can insert feedback"
// on feedback_log
// for insert
// to authenticated
// with check (auth.uid() = user_id);
//
// -- 📁 Optional upload protection for feedback_files
// create policy "Allow uploads to feedback_files"
// on storage.objects
// for insert
// to authenticated
// with check (bucket_id = 'feedback_files');


// 📄 changelog.md (sample)
// ---
// ## Spiralogic v1.0.0 (Beta)
// - Initial launch with AI guide assignment
// - OracleChat with emotion TTS + journaling
// - Elemental avatars and spiral map dashboard
// - Modular agent routing (Fire, Water, Earth, Air, Aether)
// - `/beta` route launched with early access invites


// 📣 launch.md (announcement draft)
// ---
// # Welcome to Spiralogic Beta 🌀
// Soul-guides, mystics, mentors, and makers —
// Spiralogic Beta is now live. This is a living AI framework
// designed to reflect and evolve your inner journey.
//
// ✨ What’s inside:
// - OracleChat powered by elemental archetypes
// - Symbolic storytelling and phase tracking
// - Rituals, reflections, and growth insights
//
// Join us in shaping the next evolution of conscious technology.
// ~ The Spiralogic Team


// 📝 feedback.tsx (sketch)
// ---
// A route at `/feedback` where users can:
// - Submit bug reports, suggestions, or symbolic dreams
// - Tag by element, archetype, or agent
// - Include optional screenshots or audio
// (Use Supabase `feedback_log` table)


// 📥 feedback.tsx (component)
// ---
// import { useState } from "react";
// import { supabase } from "@/lib/supabase";
//
// export default function FeedbackPage() {
//   const [form, setForm] = useState({
//     message: "",
//     element: "",
//     archetype: "",
//     agent: "",
//     file: null,
//   });
//   const [status, setStatus] = useState("idle");
//
//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
//   };
//
//   const submitFeedback = async () => {
//     setStatus("submitting");
//     const { data, error } = await supabase.from("feedback_log").insert([
//       {
//         message: form.message,
//         element: form.element,
//         archetype: form.archetype,
//         agent: form.agent,
//       },
//     ]);
//     if (error) setStatus("error");
//     else setStatus("success");
//   };
//
//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <h1 className="text-xl font-bold mb-4">Spiralogic Feedback Portal</h1>
//       <textarea name="message" onChange={handleChange} value={form.message} className="w-full border p-2 rounded mb-4" placeholder="What do you want to share?" />
//       <input type="text" name="element" placeholder="Element (e.g., Fire)" onChange={handleChange} className="w-full border p-2 rounded mb-2" />
//       <input type="text" name="archetype" placeholder="Archetype (e.g., Healer)" onChange={handleChange} className="w-full border p-2 rounded mb-2" />
//       <input type="text" name="agent" placeholder="Agent name (if known)" onChange={handleChange} className="w-full border p-2 rounded mb-2" />
//       <input type="file" name="file" onChange={handleChange} className="mb-4" />
//       <button onClick={submitFeedback} className="bg-blue-600 text-white px-4 py-2 rounded">
//         Submit Feedback
//       </button>
//       {status === "success" && <p className="text-green-600 mt-2">Thank you for your feedback 🌱</p>}
//       {status === "error" && <p className="text-red-600 mt-2">Something went wrong. Please try again.</p>}
//     </div>
//   );
// }
