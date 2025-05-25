const TarotCard = ({ name, image, meaning }: { name: string; image: string; meaning: string }) => (
  <div className="text-center my-4">
    <img src={image} alt={name} className="w-32 mx-auto rounded shadow-lg" />
    <h4 className="mt-2 font-semibold text-indigo-800">{name}</h4>
    <p className="text-sm italic text-gray-600">{meaning}</p>
  </div>
);

export default TarotCard;
