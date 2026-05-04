export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-2xl prose-body space-y-4">
      <h1 className="text-2xl font-semibold">Community guidelines</h1>
      <p>
        These rules keep RemoteOTE useful and keep us out of trouble. Posts that violate them get removed.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Stick to your own experience.</strong> Review companies you actually interviewed at, worked at,
          or were pitched by. No second-hand drama.
        </li>
        <li>
          <strong>Be specific.</strong> "They suck" is useless. "OTE was advertised as $120k, actual reps clearing
          &lt;$60k after 18 months" is gold.
        </li>
        <li>
          <strong>No personal attacks.</strong> Critique the company, the role, the comp plan — not individual
          coworkers by name.
        </li>
        <li>
          <strong>No doxxing, no leaked materials.</strong> Don't post home addresses, copies of NDAs, internal docs,
          or anything that could reasonably get you sued.
        </li>
        <li>
          <strong>No spam, no recruiter posts pretending to be reviews.</strong> If you're a recruiter or hiring
          manager and you want to respond, identify yourself.
        </li>
        <li>
          <strong>Anonymous by default.</strong> Use it. Retaliation is real in sales and we're not naive about it.
        </li>
      </ul>
    </div>
  );
}
