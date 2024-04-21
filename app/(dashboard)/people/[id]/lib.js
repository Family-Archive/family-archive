const findSpouseId = (person) => {
  const spouseRelationship = person.indirectRelationships.find(r => r.relationshipType.name === 'Married') 
  if (spouseRelationship !== undefined) {
    const spouse = spouseRelationship.people.find(p => p.id !== person.id)
    return spouse.id
  }

  return undefined
}

export {
    findSpouseId
}
