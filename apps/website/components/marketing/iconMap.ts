import type { LucideIcon } from "lucide-react";
import {
  PhoneCall,
  CalendarCheck,
  MapPin,
  MessageSquare,
  MessageCircleReply,
  Siren,
  ShieldX,
  FileText,
  Send,
  Languages,
  Briefcase,
  ShieldCheck,
  Sparkles
} from "lucide-react";

// Covers every icon name used across content/*.ts. Unknown names fall back to `defaultIcon`.
export const iconMap: Record<string, LucideIcon> = {
  PhoneCall,
  CalendarCheck,
  MapPin,
  MessageSquare,
  MessageCircleReply,
  Siren,
  ShieldX,
  FileText,
  Send,
  Languages,
  Briefcase,
  ShieldCheck
};

export const defaultIcon: LucideIcon = Sparkles;

export function resolveIcon(name: string): LucideIcon {
  return iconMap[name] ?? defaultIcon;
}
