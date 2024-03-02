import Search from './components/search';

export default async function Page() {
  return (
    <div className="w-full h-full col space-y-8 p-8">
      <div className="row-x">
        <h1>Welcome to Foodies</h1>
      </div>
      <Search />
    </div>
  );
}
