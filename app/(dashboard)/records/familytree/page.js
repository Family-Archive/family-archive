import { default as FamilyTreeComponent } from '@/components/FamilyTree/FamilyTree'
import FamilyTree from '@/lib/classes/FamilyTree/FamilyTree'

const familyTreePage = async () => {
  const familyTree = new FamilyTree()
  await familyTree.initialize()

  return (
    <>
      <h1 className='title'>Family Tree</h1>
      <FamilyTreeComponent people={familyTree.nodes} tree={familyTree.tree} />
    </>
  )
};

export default familyTreePage;
