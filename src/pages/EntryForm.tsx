import { useNavigate, useParams } from "react-router-dom";
import EntryWizard from "@/components/EntryWizard";
import { todayISO, useEntries } from "@/lib/milk/data";
import { useCurrentDairy } from "@/lib/milk/useCurrentDairy";

export default function EntryForm() {
  const { date: p } = useParams();
  const date = p || todayISO();
  const navigate = useNavigate();
  const { current } = useCurrentDairy();
  const { data: entries, isLoading } = useEntries(current?.id);
  if (!current || isLoading) return null;
  return (
    <EntryWizard open onOpenChange={(v) => !v && navigate("/calendar")} dairy={current} date={date}
      existing={entries?.find((e) => e.entry_date === date)} />
  );
}
