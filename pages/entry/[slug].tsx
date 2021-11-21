import React from 'react'
import { Layout } from '@components/Layout'
import { RichText } from '@components/RichText'
import { Grid } from '@ui/Grid'
import { Typography } from '@ui/Typography'
import { AuthorCard } from '../../components/AuthorCard';
import { getPlant, getPlantList } from '@api'
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { getCategoryList } from './../../api/index';
import { PlantEntryInline } from '@components/PlantCollection'
import Link from 'next/link'


type PlantEntryProps = {
  plant: Plant;
  otherEntries: Plant[] | null;
  categories: Category[] | null;
}


// 1.- Como alimentar la pagina
export const getStaticProps: GetStaticProps<PlantEntryProps> = async ({ params }) => {

  const slug = params?.slug;
  if (typeof slug !== 'string') {
    return {
      notFound: true
    }
  }

  try {
    const plant = await getPlant(slug);
    const otherEntries = await getPlantList({ limit: 5 });
    const categories = await getCategoryList({ limit: 10 });

    return {
      props: {
        plant: plant,
        otherEntries,
        categories
      },
      revalidate: 5 * 60 // Cada cuanto tiene que ir al servidor para tener actualizadas las paginas
    }
  } catch (error) {
    return {
      notFound: true
    }
  }
}


// 2.- Que paginas se renderizan
type PathType = {
  params: {
    slug: string;
  }
}
export const getStaticPaths = async () => {

  const entries = await getPlantList({ limit: 10 });
  const paths: PathType[] = entries.map(plant => (
    {
      params: {
        slug: plant.slug
      }
    }
  ))


  return {
    paths,
    // fallback: true
    fallback: 'blocking' // Habilita ISG
    //fallback: false// 404 en las entradas no encontradas
  }
}

export default function PlantEntryPage({
  plant,
  otherEntries,
  categories
}: InferGetStaticPropsType<typeof getStaticProps>) {

  // ESTO ES PARA FALLBACK: TRUE
  // const router = useRouter();

  // if (router.isFallback) {
  //   // Nextjs está cargando
  //   return (<Layout>
  //     Loading awesomeness...
  //   </Layout>)
  // }

  return (
    <Layout>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} component="article">
          <figure>
            <img width={962} src={plant?.image.url} alt={plant?.image.title} />
          </figure>
          <div className="px-12 pt-8">
            <Typography variant="h2">
              {plant?.plantName}
            </Typography>
          </div>
          <div className="p-10">
            <RichText richText={plant?.description} />
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3} component="aside">
          <section>
            <Typography variant="h5" component="h3" className="mb-4">
              Recent Posts
            </Typography>
            {otherEntries?.map((plantEntry) => (
              <article className="mb-4" key={plantEntry.id}>
                <PlantEntryInline {...plantEntry} />
              </article>
            ))}
          </section>
          <section className="mt-10">
            <Typography variant="h5" component="h3" className="mb-4">
              Categories
            </Typography>
            <ul className="list">
              {categories?.map(category => (
                <li key={category.id}>
                  <Link passHref href={`/category/${category.slug}`}>
                    <Typography component="a" variant="h6">
                      {category.title}
                    </Typography>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Grid>
      </Grid>
      <section className="my-4 border-t-2 border-b-2 border-gray-200 pt-12 pb-7">
        <AuthorCard {...plant?.author} />
      </section>
    </Layout>
  )
}
