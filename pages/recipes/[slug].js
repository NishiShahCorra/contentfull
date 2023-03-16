import { createClient } from "contentful";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Skeleton from "../../components/Skeleton";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});

export const getStaticPaths = async () => {
  const res = await client.getEntries({
    content_type: "recipe",
  });

  const paths = res.items.map((item) => {
    return {
      params: { slug: item.fields.slug },
    };
  });
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { items } = await client.getEntries({
    content_type: "recipe",
    "fields.slug": params.slug,
  });

  if (!items.length) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { recipe: items[0] },
  };
};

export default function RecipeDetails({ recipe }) {
  console.log("recipe--", recipe);
  if (!recipe) return <Skeleton />;
  const { featuredImage, title, slug, cookingTime, ingrediants, method } =
    recipe.fields;
  return (
    <div>
      <div className="banner"></div>
      <Image
        src={`https:${featuredImage.fields.file.url}`}
        width={featuredImage.fields.file.details.image.width}
        height={700}
      />
      <h2>{title}</h2>
      <div className="info">
        <p>Take about {cookingTime} min to cook.</p>
        <h3>ingredients:</h3>
        {ingrediants.map((ing) => (
          <span key={ing}>{ing}</span>
        ))}
      </div>
      <div className="method">
        <h3>method:</h3>
        <div>{documentToReactComponents(method)}</div>
        <style jsx>{`
          h2,
          h3 {
            text-transform: uppercase;
          }
          .banner h2 {
            margin: 0;
            background: #fff;
            display: inline-block;
            padding: 20ox;
            position: relative;
            top: -60px;
            left: -10ox;
            transform: rotateZ(-1deg);
            box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
          }
          .info p {
            margin: 0;
          }
          .info span::after {
            content: ", ";
          }
          .info span:last-child::after {
            content: ".";
          }
        `}</style>
      </div>
    </div>
  );
}
