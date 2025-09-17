export default function WelcomeMessage({ user }) {
  const name = user.displayName;
  return (
    <div className="drop-shadow-lg mb-4 text- left min-w-0 ">
      <h1 className="text-xl  text-ibex-purple">welcome</h1>
      <h1 className="text-xl font-light text-ibex-purple truncate">{name}</h1>
    </div>
  );
}
