/// <reference types="cypress" />

context('ErrorBoundary', () => {
  beforeEach(() => {
    cy.visit('http://localhost:6060/')
  })

  it('loading...', () => {
    cy.get('[data-testid="ErrorBoundary-examples"] [data-testid="preview-wrapper"]:eq(0)').as('Example')
    cy.get('@Example').find('button').click()
    cy.get('@Example').should('contain', 'Loading...')
    cy.wait(3000)
    cy.get('@Example').should('contain', 'https://httpbin.org/delay/3')
  })

  it('404', (done) => {
    cy.on('uncaught:exception', (err) => {
      expect(err.name).include('404');
      done();
    });
    cy.get('[data-testid="ErrorBoundary-examples"] [data-testid="preview-wrapper"]:eq(1)').as('Example')
    cy.get('@Example').find('button').click()
    cy.get('@Example').should('contain', 'Loading...')
    cy.get('@Example').should('contain', 'Error')
  });
})
