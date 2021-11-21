import { Layout } from "@components/Layout";
import { PlantCollection } from "@components/PlantCollection";
import { getPlantList } from './../api/index';
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { Authors } from "@components/Authors";
import { Hero } from "@components/Hero";

type HomeProps = { plants: Plant[] }

export const getStaticProps: GetStaticProps<HomeProps> = async () => {

  const plants = await getPlantList({ limit: 10 });
  return {
    props: {
      plants
    },
    revalidate: 5 * 60// Cada cuanto tiene que refrescar una pagina. En este caso 5 minutos
  }
}

export default function Home({ plants }: InferGetStaticPropsType<typeof getStaticProps>) {

  return (
    <Layout>
      <Hero {...plants[0]} className="mb-20" />
      <Authors className="mb-10" />
      <PlantCollection plants={plants.slice(1, 3)} variant="vertical" className="mb-24" />
      <PlantCollection plants={plants} variant="square" />
    </Layout>
  )
}