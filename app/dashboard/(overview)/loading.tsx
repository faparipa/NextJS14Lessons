//ha külön zárójelbe tett mappát használok az nem jelenik meg a böngésző útvonalában viszont a layout csak a mappán belüli page-re vonatkozik
//1. ha létrehozom ezt a file-t ez elég ahhoz hogy a Loading... feliratot lássuk az adatok betöltődéséig
//2. a DashboardSkeleton érdekesebb az oldal vázát mutatja ehhez persz az ui-ban meg kell azt csinálni
//ha használjuk a <suspense> - akkor csak azok az adatok nem jelennek meg a betöltődésig
import DashboardSkeleton from "../../ui/skeletons"

const Loading = () => {
  return (
   //1. <div>Loading....</div>
   
//2.
   <DashboardSkeleton/>
  )
}

export default Loading