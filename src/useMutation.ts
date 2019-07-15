import useFetch, { FetchContext } from ".";
import { useContext, useCallback } from "react";
import { invariant, isString, useURLRequiredInvariant } from "./utils";

export const useMutation = <TData = any>(
  arg1: string | TemplateStringsArray,
  arg2?: string
) => {
  const context = useContext(FetchContext);

  useURLRequiredInvariant(!!context.url && Array.isArray(arg1), "useMutation");
  useURLRequiredInvariant(
    !!context.url && isString(arg1) && !arg2,
    "useMutation",
    'OR you need to do useMutation("https://example.com", `your graphql mutation`)'
  );

  // regular no context: useMutation('https://example.com', `graphql MUTATION`)
  let url = arg1;
  let MUTATION = arg2 as string;

  // tagged template literal with context: useMutation`graphql MUTATION`
  if (Array.isArray(arg1) && context.url) {
    invariant(
      !arg2,
      "You cannot have a 2nd argument when using tagged template literal syntax with useMutation."
    );
    url = context.url;
    MUTATION = arg1[0];

    // regular with context: useMutation(`graphql MUTATION`)
  } else if (arg1 && !arg2 && context.url) {
    url = context.url;
    MUTATION = arg1 as string;
  }

  const request = useFetch<TData>(url as string);

  const mutate = useCallback(
    (inputs?: object) => request.mutate(MUTATION, inputs),
    [MUTATION, request]
  );

  return Object.assign([request.data, request.loading, request.error, mutate], {
    ...request,
    mutate
  });
};
