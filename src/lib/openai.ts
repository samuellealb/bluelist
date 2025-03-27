import { useFetch } from '#app';

const callListCurator = async (users: string, lists: string) => {
  const { data, error } = await useFetch('/api/openai', {
    method: 'POST',
    body: { users, lists },
  });

  if (error.value) {
    throw new Error(error.value.message);
  }

  return data.value;
};

export { callListCurator };
