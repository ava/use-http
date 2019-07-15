// import React, { useEffect } from "react"
// import ReactDOM from 'react-dom'
// import {
//   render,
//   cleanup,
//   waitForElement
// } from '@testing-library/react'
import { useQuery } from '..'

// import { FetchMock } from "jest-fetch-mock"

// const fetch = global.fetch as FetchMock

// import { act } from "react-dom/test-utils"

// Provider Tests =================================================
/**
 * Test Cases
 * Provider:
 * 1. URL only
 * 2. Options only
 * 3. graphql only
 * 4. URL and Options only
 * 5. URL and graphql only
 * 6. Options and graphql only
 * 7. URL and graphql and Options
 * useFetch:
 * A. const [data, loading, error, query] = useQuery('http://url.com', `grqphql query`)
 * B. const {data, loading, error, query} = useQuery('http://url.com', `grqphql query`)
 * C. const [data, loading, error, request] = useQuery(`grqphql query`)
 * D. const [data, loading, error, request] = useQuery`graphql query`
 */
describe('useQuery - general', () => {
  it('should be defined/exist when imported', () => {
    expect(typeof useQuery).toBe('function')
  })
})
