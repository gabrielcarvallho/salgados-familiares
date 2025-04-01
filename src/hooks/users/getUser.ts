import { useApiBase } from "../useApiBase"; // Ajuste o caminho de importação conforme necessário

// Interface para tipar a resposta da API


export const useUser = () => {
  const { data, error, isLoading } = useApiBase(
    "/accounts/users/",
  );

  return {
    // id: data?.user.id ?? "",
    // primeiroNome: data?.user?.first_name ?? "",
    // ultimoNome: data?.user?.last_name ?? "",
    // email: data?.user?.email ?? "",
    // isAdminContabilidade: data?.user?.is_admin_contabilidade ?? false,
    // profilePicture: data?.user?.profile_picture ?? "",
    isLoading,
    isError: error ? String(error) : null,
  };
};

export const useUserById = (id: string) => {
    const { data, error, isLoading } = useApiBase(
        `/accounts/users/?id=${id}`,
      );
      return {
        // id: data?.user.id ?? "",
        // primeiroNome: data?.user?.first_name ?? "",
        // ultimoNome: data?.user?.last_name ?? "",
        // email: data?.user?.email ?? "",
        // isAdminContabilidade: data?.user?.is_admin_contabilidade ?? false,
        // profilePicture: data?.user?.profile_picture ?? "",
        isLoading,
        isError: error ? String(error) : null,
      };
}