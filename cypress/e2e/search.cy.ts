describe('search page', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-test="main-title"]').contains('Welcome, Foodies');
    cy.get('[data-test="applicant-input"]').type('momo');
    cy.get('[data-test="applicant"]').contains('MOMO INNOVATION');

    cy.get('[data-test="status-dropdown"]').click();
    cy.get('[data-test="requested-dropdown-item"]').click();
    cy.get('[data-test="status"]').contains('REQUESTED');

    cy.get('[data-test="address-mode"]').click();
    cy.get('[data-test="address-input"]').type('cali');
    cy.get('[data-test="address"]').contains('CALIFORNIA');

    // Can't easily do geolocation testing with cypress, so just call the endpoint directly
    cy.request('http://localhost:4000/api/search/nearby?latitude=40.7171899&longitude=-82.5621485').as('results');
    cy.get('@results').should((results: any) => {
      expect(results.status).to.equal(200);
      expect(results.body[0].facility.applicant).to.equal('Cochinita');
    });
  })
})
