export type Integration = { name: string; logo: string; blurb: string };

export const integrations: Integration[] = [
  { name: "Jobber", logo: "/integrations/jobber.svg",
    blurb: "Books jobs into Jobber with the right service, time, and technician — respecting availability and service area." },
  { name: "Housecall Pro", logo: "/integrations/housecall-pro.svg",
    blurb: "Creates real Housecall Pro jobs from live calls, with address and service-area validation built in." },
  { name: "ServiceTitan", logo: "/integrations/servicetitan.svg",
    blurb: "Dispatch-grade booking into ServiceTitan that respects tech skills, schedules, and your coverage map." }
];

export const bookingSteps: { title: string; body: string }[] = [
  { title: "1. Check real availability",
    body: "Handled queries your FSM for an actual open slot that matches the service, the tech's skills, and your service area — never a guess." },
  { title: "2. Confirm verbatim",
    body: "The caller hears the service, time, and address read back and confirms before anything is written." },
  { title: "3. Create the job",
    body: "Handled creates the real job in your FSM and texts the caller a confirmation — then notifies you with a summary." }
];
