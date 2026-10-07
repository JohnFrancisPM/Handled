export type Feature = {
  icon: string;          // lucide-react icon name, resolved in the component
  title: string;
  blurb: string;
  status: "live" | "roadmap";
};

export const features: Feature[] = [
  { icon: "PhoneCall", title: "24/7 natural-language answering",
    blurb: "Every call answered around the clock in a natural conversation — no phone tree, no voicemail. Callers just talk.", status: "live" },
  { icon: "CalendarCheck", title: "Books real jobs into your FSM",
    blurb: "Checks live availability and creates the job in Jobber, Housecall Pro, or ServiceTitan — respecting tech skills, availability, and service area.", status: "live" },
  { icon: "MapPin", title: "Address & service-area check",
    blurb: "Validates the caller's address against your service radius so you're never booked outside the area you cover.", status: "live" },
  { icon: "MessageSquare", title: "SMS confirmations",
    blurb: "Sends the caller a text with the appointment details the moment the job is booked.", status: "live" },
  { icon: "MessageCircleReply", title: "Missed-call text-back",
    blurb: "If a call is abandoned or overflows, Handled texts the caller within seconds and continues the booking over SMS.", status: "live" },
  { icon: "Siren", title: "Trade-aware emergency triage",
    blurb: "Recognizes a burst pipe, gas smell, or no-heat-in-winter as urgent and escalates to your on-call tech immediately.", status: "live" },
  { icon: "ShieldX", title: "Spam & robocall filtering",
    blurb: "Screens junk so you're never notified — or charged — for spam calls and hangups.", status: "live" },
  { icon: "FileText", title: "Transcripts, summaries & owner notify",
    blurb: "Every call produces a transcript, a structured summary, and an owner notification so you can see exactly what Handled did.", status: "live" },
  { icon: "Send", title: "Outbound follow-up",
    blurb: "Quote follow-ups, appointment reminders, and review requests — tied to the job record.", status: "roadmap" },
  { icon: "Languages", title: "Spanish support",
    blurb: "Bilingual English/Spanish answering for your callers and crews.", status: "roadmap" }
];
