import useFetch, { FetchContext } from ".";
import { useContext, useCallback } from "react";
import { invariant, isString, useURLRequiredInvariant } from "./utils";

export const useQuery = <TData = any>(
  arg1: string | TemplateStringsArray,
  arg2?: string
) => {
  const context = useContext(FetchContext);

  useURLRequiredInvariant(!!context.url && Array.isArray(arg1), "useQuery");
  useURLRequiredInvariant(
    !!context.url && isString(arg1) && !arg2,
    "useQuery",
    'OR you need to do useQuery("https://example.com", `your graphql query`)'
  );

  // regular no context: useQuery('https://example.com', `graphql QUERY`)
  let url = arg1;
  let QUERY = arg2 as string;

  // tagged template literal with context: useQuery`graphql QUERY`
  if (Array.isArray(arg1) && context.url) {
    invariant(
      !arg2,
      "You cannot have a 2nd argument when using tagged template literal syntax with useQuery."
    );
    url = context.url;
    QUERY = arg1[0];

    // regular with context: useQuery(`graphql QUERY`)
  } else if (arg1 && !arg2 && context.url) {
    url = context.url;
    QUERY = arg1 as string;
  }

  const request = useFetch<TData>(url as string);

  const query = useCallback((inputs?: object) => request.query(QUERY, inputs), [
    QUERY,
    request
  ]);

  return Object.assign([request.data, request.loading, request.error, query], {
    ...request,
    query
  });
};
