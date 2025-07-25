import ItemList from '../components/item-list';

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center mt-8 my-24">
      <h1 className="text-xl font-bold mb-16 text-center">
        Review Your Bill Data!
      </h1>
      <ItemList />
    </div>
  );
}
