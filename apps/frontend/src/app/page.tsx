import Search from './search';

export default async function Page() {
  return (
    <div className="w-full h-full col space-y-8 p-8">
      <div className="flex justify-center">
        <h1>Welcome to Foodies</h1>
      </div>
      <Search />
    </div>
  );
}
