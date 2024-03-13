import { prisma } from '@/app/db/prisma'
import lib from '@/lib/lib'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers'

export default class FamilyTree {
  people;
  rootNode;
  session;
  nodes;
  tree;

  async initialize() {
    this.session = await getServerSession(authOptions)

    this.people = await this.fetchPeople()
    this.rootNode = await this.getRootNode()
    this.nodes = this.getNodes()
    this.tree = this.buildTree()
  }

  exportData() {

  }

  /**
   * Get a where clause that includes limitation by the user's
   * current family.
   * @param {object} where
   * @return {object}
   */
  getWhereClause(where = {}) {
    return lib.limitQueryByFamily(where, cookies(), this.session.familyId)
  } 

  /**
   * Get records for all people in the current family.
   */
  async fetchPeople() {
    const people = await prisma.Person.findMany({
      include: {
        parents: true,
        children: true,
        indirectRelationships: {
          include: {
            relationshipType: true,
            people: true,
          }
        }
      },
      where: this.getWhereClause()
    })

    const peopleMap = new Map()
    people.forEach(person => {
      peopleMap.set(person.id, person)
    })
    return peopleMap
  }

  /**
   * Convert the results of the people query into a series
   * of node objects, each of which represents either an
   * individual or a relationship.
   */
  getNodes() {
    const nodes = new Map()

    this.people.forEach(person => {
      let node
      const nodeType = person.indirectRelationships.length > 0 ? 'relationship' : 'person'

      if (nodeType === 'relationship') {
        node = {
          id: person.indirectRelationships[0].id,
          type: 'relationship',
          people: person.indirectRelationships[0].people,
          children: person.children,
          parents: person.parents,
        }
      } else {
        node = {
          id: person.id,
          type: 'person',
          people: [person],
          children: person.children,
          parents: person.parents,
        }
      }

      // If this node id already exists, it is because this node represents
      // a relationship and one or more people in that relationship have already
      // been processed. In this case, add any parents and children that this 
      // person brings to the relationship node.
      let existingNode = nodes.get(node.id)
      if (existingNode !== undefined) {
        existingNode.parents.forEach(parent => {
          const idFoundInNewNode = node.parents.find(p => p.id == parent.id)
          if (idFoundInNewNode === undefined) {
            node.parents = node.parents.concat(parent)
          }
        })

        existingNode.children.forEach(child => {
          const idFoundInNewNode = node.children.find(c => c.id == child.id)
          if (idFoundInNewNode === undefined) {
            node.children.concat(child)
          }
        })
      }

      nodes.set(node.id, node)
    })

    return nodes
  }

  /**
   * Find the root node for the tree. This will either be a relationship
   * node or an individual person node.
   */
  async getRootNode() {
    let whereClause = this.getWhereClause({
      people: {
        every: {
          parents: {
            none: {}
          }
        }
      }
    })

    let rootNode = await prisma.IndirectRelationship.findFirst({
      where: whereClause
    })

    // If we didn't find a root node by searching relationships,
    // try searching individuals.
    if (rootNode.length === 0) {
      whereClause = this.getWhereClause({
        indirectRelationships: {
          none: {}
        },
        parents: {
          none: {}
        }
      })
      rootNode = await prisma.Person.findFirst({
        include: {
          indirectRelationships: true,
          parents: true,
          children: true,
        },
        where: whereClause
      }) 
    }

    return rootNode
  }

  /**
   * Assemble the tree object recursively, starting
   * from the root node.
   */
  buildTree() {
    let node = this.nodes.get(this.rootNode.id)
    node.children = this.getChildren(node)
    node.parents = undefined
    return node
  }

  /**
   * Given a node, return all the node's child nodes recursively.
   *
   * @param {Node} node
   * @return {array} of nodes
   */
  getChildren(node) {
    let children = []

    node.children.forEach(person => {
      // Each child will have a person's id. We need to figure out
      // if that person is an individual or part of a relationship
      // in order to build the correct type of node to the tree.
      const personRecord = this.people.get(person.id)

      if (personRecord.indirectRelationships.length === 0) {
        const child = this.nodes.get(person.id)
        child.children = this.getChildren(child)
        child.parents = undefined
        children.push(child)
      } else {
        // This person is part of a relationship, so add their relationship node
        // to the tree.
        const child = this.nodes.get(personRecord.indirectRelationships[0].id)
        child.children = this.getChildren(child)
        child.parents = undefined
        children.push(child)
      }
    })

    return children
  }
}

