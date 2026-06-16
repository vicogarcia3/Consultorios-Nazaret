export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return <div>Editar turno {params.id}</div>;
}