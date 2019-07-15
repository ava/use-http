import { makeConfig } from "../makeConfig";
import { renderHook } from '@testing-library/react-hooks';

describe.only('use-http configuration', () => {
  it('should create a default configuration with no arguments', () => {
    const config = renderHook(() => makeConfig({}, "http://blah.com"))

    expect(config.result.current).toEqual({ onMount: false, url: "http://blah.com" })
  });
});