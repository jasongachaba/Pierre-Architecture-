interface SectionLabelProps {
  number: string;
  label: string;
}

export default function SectionLabel({
  number,
  label,
}: SectionLabelProps) {
  return (
    <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-[#77736c]">
      <span className="text-[#a77b4e]">{number}</span>

      <span className="h-px w-10 bg-[#cfc8bb]" />

      <span>{label}</span>
    </div>
  );
}