import type { GetServerSideProps, NextPage } from 'next';

const Page: NextPage = () => {
  return null;
};

export default Page;

export const getServerSideProps: GetServerSideProps = async() => {
  return {
    redirect: {
      destination: 'https://stats.quai.network',
      permanent: false,
    },
  };
};
