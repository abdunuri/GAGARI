type FeatureCardProps = {
    title:String;
    description:String;
}

export default function FeatureCard({title,description}:FeatureCardProps){
    return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </div>
    )
};