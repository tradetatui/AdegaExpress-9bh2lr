import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-8xl">🍾</p>
      <div>
        <h1 className="font-display font-bold text-4xl text-tx-primary">404</h1>
        <p className="text-tx-secondary mt-2 text-lg">Página não encontrada</p>
        <p className="text-tx-muted text-sm mt-1">Essa garrafa está vazia... mas temos mais!</p>
      </div>
      <Link to="/" className="btn-primary">
        Ir para Home
      </Link>
    </div>
  );
}
