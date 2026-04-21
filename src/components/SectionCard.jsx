export default function SectionCard({ title, children }) {
  return (
    <section className="card">
      <div className="card-title">{title}</div>
      {children}
    </section>
  );
}
