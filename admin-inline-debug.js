(function () {
        const statusEl = document.getElementById('upload-status');
        const uploadsListEl = document.getElementById('uploads-list');
        const uploadsSearchInput = document.getElementById('uploads-search');
        const uploadsFolderInput = document.getElementById('uploads-folder');
        const uploadsPathbarEl = document.getElementById('uploads-pathbar');
        const createUploadFolderButton = document.getElementById('create-upload-folder');
        const uploadsGoRootButton = document.getElementById('uploads-go-root');
        const uploadsGoParentButton = document.getElementById('uploads-go-parent');
        const galleryEditorData = {"pieces":[{"id":"chairs-black-tree-trunk-with-live-edge-from-sisso-wood","title":"Black Sisso Live Edge Chair","category":"Living Room","subcategory":"Chairs","material":"Sisso wood, Tree trunk timber, Live edge detailing","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174387734.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174387734.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174387894.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174388317.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174388429.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174388800.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174388842.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174495762.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174495908.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174496124.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/1661174861764.jpg","/uploads/aon%20imgaes/chairs/black%20tree%20trunk%20with%20live%20edge%20from%20sisso%20wood/FB_IMG_1662390480574.jpg"]},{"id":"chairs-bomba-chair-with-flank-old-wood","title":"Bomba Chair in Reclaimed Plank Wood","category":"Living Room","subcategory":"Chairs","material":"Solid timber construction","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/bomba%20chair%20with%20flank%20old%20wood/0D2A5571.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/bomba%20chair%20with%20flank%20old%20wood/0D2A5571.jpg","/uploads/aon%20imgaes/chairs/bomba%20chair%20with%20flank%20old%20wood/0D2A5572.jpg","/uploads/aon%20imgaes/chairs/bomba%20chair%20with%20flank%20old%20wood/0D2A5577.jpg"]},{"id":"chairs-curved-tree-stamp-from-sisso-wood","title":"Curved Sisso Stump Chair","category":"Living Room","subcategory":"Chairs","material":"Sisso wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174387383.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174387383.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174387894.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174388317.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174388429.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174388674.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174495438.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174495762.jpg","/uploads/aon%20imgaes/chairs/curved%20tree%20stamp%20from%20sisso%20wood/1661174861729.jpg"]},{"id":"chairs-tree-wood-curved-chair","title":"Curved Tree Wood Chair","category":"Living Room","subcategory":"Chairs","material":"Solid timber construction","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/tree%20wood%20curved%20chair/0D2A1131.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/tree%20wood%20curved%20chair/0D2A1131.jpg","/uploads/aon%20imgaes/chairs/tree%20wood%20curved%20chair/0D2A1207.jpg","/uploads/aon%20imgaes/chairs/tree%20wood%20curved%20chair/0D2A1220-Recovered.jpg","/uploads/aon%20imgaes/chairs/tree%20wood%20curved%20chair/0D2A1222.jpg"]},{"id":"chairs-massive-beech-wood-with-tree-trunk-chair-in-bleached-white","title":"Massive Beech Wood With Tree Trunk Chair In Bleached White","category":"Living Room","subcategory":"Chairs","material":"Beech wood, Tree trunk timber","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174388086.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174388086.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174388203.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174388355.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174496089.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174496198.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20with%20tree%20trunk%20chair%20in%20bleached%20white/1661174861590.jpg"]},{"id":"chairs-stool-from-train-rail-old-flank-wood","title":"Stool From Train Rail Old Plank Wood","category":"Living Room","subcategory":"Chairs","material":"Reclaimed rail plank wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5895.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5895.jpg","/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5897.jpg","/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5898.jpg","/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5900.jpg","/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5903.jpg","/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5953.jpg","/uploads/aon%20imgaes/chairs/stool%20from%20train%20rail%20old%20flank%20wood/0D2A5956.jpg"]},{"id":"home-accessories-flying-shelves-from-half-tree-trunk","title":"Flying Shelves From Half Tree Trunk","category":"Living Room","subcategory":"Shelves","material":"Tree trunk timber","note":"Storage and display pieces treated as part of the room architecture.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20half%20tree%20trunk/544A0033.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20half%20tree%20trunk/544A0033.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20half%20tree%20trunk/544A0082.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20half%20tree%20trunk/544A0083.jpg"]},{"id":"home-accessories-flying-shelves-from-massive-beech-tree-wood-with-live-tree-edges","title":"Flying Shelves From Massive Beech Tree Wood With Live Tree Edges","category":"Living Room","subcategory":"Shelves","material":"Beech wood, Live edge detailing","note":"Storage and display pieces treated as part of the room architecture.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/3%20.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/3%20.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/4%20.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/5%20.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/544A0103.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/544A0143.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/544A0151.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/544A0153.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/544A0158.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/544A0219.jpg","/uploads/aon%20imgaes/home%20accessories/flying%20shelves%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges/6%20.jpg"]},{"id":"chairs-sofa-from-pine-and-beech-wood-from-connected-separated-parts","title":"Connected Pine and Beech Sofa","category":"Living Room","subcategory":"Sofa","material":"Pine wood, Beech wood","note":"Lounge pieces with handcrafted structure and a softer room rhythm.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6051.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6051.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6081.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6099.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6117.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6121.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6393.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6458.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20pine%20and%20beech%20wood%20from%20connected%20separated%20parts/0D2A6469.jpg"]},{"id":"coffee-tables-acacia-leaving-table","title":"Acacia Coffee Table","category":"Living Room","subcategory":"Tables","material":"Acacia wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/acacia%20leaving%20table/IMG_20220422_145647.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/acacia%20leaving%20table/IMG_20220422_145647.jpg"]},{"id":"coffee-tables-coffee-table-from-massive-beech-wood-tree-slaps","title":"Coffee Table From Massive Beech Wood Tree Slabs","category":"Living Room","subcategory":"Tables","material":"Beech wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/1%20.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/1%20.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/2%20.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/3%20.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/4%20.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/5%20.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/544A0055.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/6%20.jpg","/uploads/aon%20imgaes/coffee%20tables/coffee%20table%20from%20massive%20beech%20wood%20tree%20slaps/7%20.jpg"]},{"id":"coffee-tables-contar-oak-leaving-table","title":"Contar Oak Coffee Table","category":"Living Room","subcategory":"Tables","material":"Oak wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/0D2A0341.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/0D2A0341.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/0D2A0342.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/0D2A0343.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/0D2A0351.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/0D2A0355.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/IMG-20240404-WA0045.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/IMG-20240405-WA0080.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/IMG-20240405-WA0081.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/IMG-20240405-WA0082.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/IMG-20240405-WA0083.jpg","/uploads/aon%20imgaes/coffee%20tables/contar%20oak%20leaving%20table/WhatsApp%20Image%202024-04-04%20at%2023.54.33_0fe96861.jpg"]},{"id":"coffee-tables-leaving-table-made-of-glass-top-and-flank-wood-from-old-train-rail-wood","title":"Glass and Rail Plank Coffee Table","category":"Living Room","subcategory":"Tables","material":"Glass, Reclaimed rail plank wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6041.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6041.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6044.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6051.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6081.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6099.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6111.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6384.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6389.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6393.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6403.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6405.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6458.jpg","/uploads/aon%20imgaes/coffee%20tables/leaving%20table%20made%20of%20glass%20top%20and%20flank%20wood%20from%20old%20train%20rail%20wood/0D2A6469.jpg"]},{"id":"coffee-tables-kaya-tree-trunk-side-table","title":"Kaya Tree Trunk Side Table","category":"Living Room","subcategory":"Tables","material":"Tree trunk timber","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/kaya%20tree%20trunk%20side%20table/544A0206.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/kaya%20tree%20trunk%20side%20table/544A0206.jpg","/uploads/aon%20imgaes/coffee%20tables/kaya%20tree%20trunk%20side%20table/544A0231.jpg"]},{"id":"coffee-tables-massive-beech-wood-from-tree-slaps-leaving-table","title":"Massive Beech Wood From Tree Slabs Coffee Table","category":"Living Room","subcategory":"Tables","material":"Beech wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/massive%20beech%20wood%20from%20tree%20slaps%20leaving%20table/1661174387970.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/massive%20beech%20wood%20from%20tree%20slaps%20leaving%20table/1661174387970.jpg","/uploads/aon%20imgaes/coffee%20tables/massive%20beech%20wood%20from%20tree%20slaps%20leaving%20table/1661174388715.jpg","/uploads/aon%20imgaes/coffee%20tables/massive%20beech%20wood%20from%20tree%20slaps%20leaving%20table/1661174495727.jpg","/uploads/aon%20imgaes/coffee%20tables/massive%20beech%20wood%20from%20tree%20slaps%20leaving%20table/1661174495834.jpg","/uploads/aon%20imgaes/coffee%20tables/massive%20beech%20wood%20from%20tree%20slaps%20leaving%20table/1661174495980.jpg"]},{"id":"coffee-tables-oak-wood-with-resin-side-table","title":"Oak Wood With Resin Side Table","category":"Living Room","subcategory":"Tables","material":"Oak wood, Resin detailing","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/oak%20wood%20with%20resin%20side%20table/IMG_0022.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/oak%20wood%20with%20resin%20side%20table/IMG_0022.jpg","/uploads/aon%20imgaes/coffee%20tables/oak%20wood%20with%20resin%20side%20table/IMG_0027.jpg","/uploads/aon%20imgaes/coffee%20tables/oak%20wood%20with%20resin%20side%20table/IMG_0028.jpg","/uploads/aon%20imgaes/coffee%20tables/oak%20wood%20with%20resin%20side%20table/IMG_0082.jpg"]},{"id":"coffee-tables-olive-wood-leaving-table","title":"Olive Wood Coffee Table","category":"Living Room","subcategory":"Tables","material":"Olive wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5509.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5509.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5515.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5517.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5550.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5554.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5558.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20leaving%20table/0D2A5565.jpg"]},{"id":"coffee-tables-olive-wood-with-resin-coffee-table","title":"Olive Wood With Resin Coffee Table","category":"Living Room","subcategory":"Tables","material":"Olive wood, Resin detailing","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1120.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1120.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1127.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1128.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1133.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1137.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1220-Recovered.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1222.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1224.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1225.jpg"]},{"id":"coffee-tables-pitch-pine-wood-in-black-color-side-table","title":"Pitch Pine Wood In Black Color Side Table","category":"Living Room","subcategory":"Tables","material":"Pitch pine","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174387257.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174387257.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174387932.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174388317.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174388429.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174388674.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174388842.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174388924.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174495329.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174495943.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/1661174861694.jpg","/uploads/aon%20imgaes/coffee%20tables/pitch%20pine%20wood%20in%20black%20color%20side%20table/FB_IMG_1662390480574.jpg"]},{"id":"coffee-tables-side-table-from-massive-berry-wood","title":"Side Table From Massive Berry Wood","category":"Living Room","subcategory":"Tables","material":"Berry wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/1%20.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/1%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/10%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/11%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/2%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/3%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/4%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/5%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/6%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/7%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/8%20.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20massive%20berry%20wood/9%20.jpg"]},{"id":"coffee-tables-side-table-from-pine-wood","title":"Side Table From Pine Wood","category":"Living Room","subcategory":"Tables","material":"Pine wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20pine%20wood/0D2A6246.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20pine%20wood/0D2A6246.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20pine%20wood/0D2A6279.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20pine%20wood/0D2A6280.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20pine%20wood/0D2A6291.jpg"]},{"id":"coffee-tables-side-table-from-train-rail-flank-wood","title":"Side Table From Train Rail Plank Wood","category":"Living Room","subcategory":"Tables","material":"Reclaimed rail plank wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5937.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5937.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5939.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5940.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5941.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5942.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5945.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5949.jpg","/uploads/aon%20imgaes/coffee%20tables/side%20table%20from%20train%20rail%20flank%20wood/0D2A5953.jpg"]},{"id":"coffee-tables-walnut-wood-with-resin-side-table","title":"Walnut Wood With Resin Side Table","category":"Living Room","subcategory":"Tables","material":"Walnut wood, Resin detailing","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/walnut%20wood%20with%20resin%20side%20table/IMG_0024.jpg","imageUrls":["/uploads/aon%20imgaes/coffee%20tables/walnut%20wood%20with%20resin%20side%20table/IMG_0024.jpg","/uploads/aon%20imgaes/coffee%20tables/walnut%20wood%20with%20resin%20side%20table/IMG_0027.jpg","/uploads/aon%20imgaes/coffee%20tables/walnut%20wood%20with%20resin%20side%20table/IMG_0028.jpg","/uploads/aon%20imgaes/coffee%20tables/walnut%20wood%20with%20resin%20side%20table/IMG_0079.jpg","/uploads/aon%20imgaes/coffee%20tables/walnut%20wood%20with%20resin%20side%20table/IMG_0081.jpg"]},{"id":"tv-unit-beech-wood-tv-unit-with-live-tree-edges","title":"Beech Wood Tv Unit With Live Tree Edges","category":"Living Room","subcategory":"TV Unit","material":"Beech wood, Live edge detailing","note":"Media storage approached with the restraint of built-in joinery.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/tv%20unit/beech%20wood%20tv%20unit%20with%20live%20tree%20edges/544A0167.jpg","imageUrls":["/uploads/aon%20imgaes/tv%20unit/beech%20wood%20tv%20unit%20with%20live%20tree%20edges/544A0167.jpg","/uploads/aon%20imgaes/tv%20unit/beech%20wood%20tv%20unit%20with%20live%20tree%20edges/544A0182.jpg","/uploads/aon%20imgaes/tv%20unit/beech%20wood%20tv%20unit%20with%20live%20tree%20edges/544A0187.jpg"]},{"id":"tv-unit-contar-oak-wood-elevated-tv-unit","title":"Contar Oak Wood Elevated Tv Unit","category":"Living Room","subcategory":"TV Unit","material":"Oak wood","note":"Media storage approached with the restraint of built-in joinery.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/tv%20unit/contar%20oak%20wood%20elevated%20tv%20unit/IMG-20240405-WA0067.jpg","imageUrls":["/uploads/aon%20imgaes/tv%20unit/contar%20oak%20wood%20elevated%20tv%20unit/IMG-20240405-WA0067.jpg"]},{"id":"tv-unit-massive-beech-wood-tv-unit-with-bleached-white-color","title":"Massive Beech Wood Tv Unit With Bleached White Color","category":"Living Room","subcategory":"TV Unit","material":"Beech wood","note":"Media storage approached with the restraint of built-in joinery.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/0D2A0195.jpg","imageUrls":["/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/0D2A0195.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/0D2A0198.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/0D2A0203.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/0D2A0205.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387102.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387218.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387422.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387460.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387578.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387618.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174387658.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174388757.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174495476.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174495512.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174495617.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174861558.jpg","/uploads/aon%20imgaes/tv%20unit/massive%20beech%20wood%20tv%20unit%20with%20bleached%20white%20color/1661174861658.jpg"]},{"id":"tv-unit-tv-unit-from-old-train-rail-flank-wood","title":"Tv Unit From Old Train Rail Plank Wood","category":"Living Room","subcategory":"TV Unit","material":"Reclaimed rail plank wood","note":"Media storage approached with the restraint of built-in joinery.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6051.jpg","imageUrls":["/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6051.jpg","/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6084.jpg","/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6102.jpg","/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6108.jpg","/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6393.jpg","/uploads/aon%20imgaes/tv%20unit/tv%20unit%20from%20old%20train%20rail%20flank%20wood/0D2A6458.jpg"]},{"id":"wall-cladding-wooden-black-strips-wall-cladding","title":"Black Strip Wall Cladding","category":"Living Room","subcategory":"Wall Artwork","material":"Solid timber construction","note":"Architectural gestures and decorative interventions documented as spatial pieces.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/6U6A0129.jpg","imageUrls":["/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/6U6A0129.jpg","/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/6U6A0144.jpg","/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/6U6A0145.jpg","/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/Copy%20of%206U6A0129.jpg","/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/Copy%20of%206U6A0144.jpg","/uploads/aon%20imgaes/wall%20cladding/wooden%20black%20strips%20wall%20cladding/Copy%20of%206U6A0145.jpg"]},{"id":"doors-hidden-door-from-pine-wood","title":"Hidden Door From Pine Wood","category":"Living Room","subcategory":"Wall Artwork","material":"Pine wood","note":"Architectural gestures and decorative interventions documented as spatial pieces.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/doors/hidden%20door%20from%20pine%20wood/0D2A5640.jpg","imageUrls":["/uploads/aon%20imgaes/doors/hidden%20door%20from%20pine%20wood/0D2A5640.jpg","/uploads/aon%20imgaes/doors/hidden%20door%20from%20pine%20wood/0D2A5643.jpg","/uploads/aon%20imgaes/doors/hidden%20door%20from%20pine%20wood/0D2A5648.jpg"]},{"id":"home-accessories-melted-glass-aquarium-on-tree-roots","title":"Melted Glass Aquarium on Tree Roots","category":"Living Room","subcategory":"Wall Artwork","material":"Glass","note":"Architectural gestures and decorative interventions documented as spatial pieces.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/0D2A0038.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/0D2A0038.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/0D2A0039.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/0D2A0050.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/0D2A0072.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/2.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/3.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/8.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/9.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/IMG_0027.jpg","/uploads/aon%20imgaes/home%20accessories/melted%20glass%20aquarium%20on%20tree%20roots/IMG_0029.jpg"]},{"id":"doors-flank-wood-door","title":"Plank Wood Door","category":"Living Room","subcategory":"Wall Artwork","material":"Solid timber construction","note":"Architectural gestures and decorative interventions documented as spatial pieces.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/doors/flank%20wood%20door/0D2A5662.jpg","imageUrls":["/uploads/aon%20imgaes/doors/flank%20wood%20door/0D2A5662.jpg","/uploads/aon%20imgaes/doors/flank%20wood%20door/0D2A5664.jpg"]},{"id":"home-accessories-socket-cover-from-wood","title":"Socket Cover From Wood","category":"Living Room","subcategory":"Wall Artwork","material":"Solid timber construction","note":"Architectural gestures and decorative interventions documented as spatial pieces.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/socket%20cover%20from%20wood/0D2A5528.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/socket%20cover%20from%20wood/0D2A5528.jpg","/uploads/aon%20imgaes/home%20accessories/socket%20cover%20from%20wood/0D2A5535.jpg","/uploads/aon%20imgaes/home%20accessories/socket%20cover%20from%20wood/0D2A5662.jpg"]},{"id":"home-accessories-vases-from-massive-tree-wood","title":"Vases From Massive Tree Wood","category":"Living Room","subcategory":"Wall Artwork","material":"Solid timber construction","note":"Architectural gestures and decorative interventions documented as spatial pieces.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0194.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0194.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0217.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0223.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0226.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0227.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0228.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A0231.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6429.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6430.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6431.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6432.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6433.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6434.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/0D2A6435.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/1661174387218.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/1661174387422.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/1661174387578.jpg","/uploads/aon%20imgaes/home%20accessories/vases%20from%20massive%20tree%20wood/1661174388279.jpg"]},{"id":"chairs-bench-from-acacia-wood-with-metal-legs","title":"Bench From Acacia Wood With Metal Legs","category":"Dining Room","subcategory":"Benches","material":"Acacia wood, Metal legs","note":"Bench forms composed with the same material honesty as the tables around them.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/bench%20from%20acacia%20wood%20with%20metal%20legs/0D2A5878.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/bench%20from%20acacia%20wood%20with%20metal%20legs/0D2A5878.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20acacia%20wood%20with%20metal%20legs/0D2A5882.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20acacia%20wood%20with%20metal%20legs/0D2A5903.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20acacia%20wood%20with%20metal%20legs/0D2A5919.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20acacia%20wood%20with%20metal%20legs/0D2A5927.jpg"]},{"id":"chairs-bench-from-massive-cherry-wood-with-metal-legs","title":"Bench From Massive Cherry Wood With Metal Legs","category":"Dining Room","subcategory":"Benches","material":"Cherry wood, Metal legs","note":"Bench forms composed with the same material honesty as the tables around them.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/bench%20from%20massive%20cherry%20wood%20with%20metal%20legs/IMG_0019.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/bench%20from%20massive%20cherry%20wood%20with%20metal%20legs/IMG_0019.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20cherry%20wood%20with%20metal%20legs/IMG_0027-copy.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20cherry%20wood%20with%20metal%20legs/IMG_0027.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20cherry%20wood%20with%20metal%20legs/IMG_0052.jpg"]},{"id":"chairs-massive-beech-wood-bench-with-tree-trunk-in-bleached-white-color","title":"Massive Beech Wood Bench With Tree Trunk In Bleached White Color","category":"Dining Room","subcategory":"Benches","material":"Beech wood, Tree trunk timber","note":"Bench forms composed with the same material honesty as the tables around them.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174387179.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174387179.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174387295.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174387774.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174387855.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174388241.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174388355.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174388883.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174389089.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174389129.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174495366.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174495870.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20bench%20with%20tree%20trunk%20in%20bleached%20white%20color/1661174861624.jpg"]},{"id":"consoles-bar-from-massive-beech-tree-wood","title":"Bar From Massive Beech Tree Wood","category":"Dining Room","subcategory":"Buffet","material":"Beech wood","note":"Storage pieces made for serving, staging, and quiet sculptural presence.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/consoles/bar%20from%20massive%20beech%20tree%20wood/6U6A0001.jpg","imageUrls":["/uploads/aon%20imgaes/consoles/bar%20from%20massive%20beech%20tree%20wood/6U6A0001.jpg","/uploads/aon%20imgaes/consoles/bar%20from%20massive%20beech%20tree%20wood/6U6A0006.jpg","/uploads/aon%20imgaes/consoles/bar%20from%20massive%20beech%20tree%20wood/6U6A0013.jpg","/uploads/aon%20imgaes/consoles/bar%20from%20massive%20beech%20tree%20wood/6U6A0021.jpg"]},{"id":"consoles-console-from-massive-beech-tree-wood-with-rough-edges","title":"Console From Massive Beech Tree Wood With Rough Edges","category":"Dining Room","subcategory":"Buffet","material":"Beech wood","note":"Storage pieces made for serving, staging, and quiet sculptural presence.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/1%20.jpg","imageUrls":["/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/1%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/10%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/11%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/12%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/2%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/3%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/4%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/5%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/6%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/7%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/8%20.jpg","/uploads/aon%20imgaes/consoles/console%20from%20massive%20beech%20tree%20wood%20with%20rough%20edges/9%20.jpg"]},{"id":"consoles-console-from-old-train-rail-flank-wood","title":"Console From Old Train Rail Plank Wood","category":"Dining Room","subcategory":"Buffet","material":"Reclaimed rail plank wood","note":"Storage pieces made for serving, staging, and quiet sculptural presence.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/consoles/console%20from%20old%20train%20rail%20flank%20wood/0D2A6308.jpg","imageUrls":["/uploads/aon%20imgaes/consoles/console%20from%20old%20train%20rail%20flank%20wood/0D2A6308.jpg"]},{"id":"consoles-bauffet-from-olive-wood-and-black-resin","title":"Olive Resin Buffet","category":"Dining Room","subcategory":"Buffet","material":"Olive wood, Resin detailing","note":"Storage pieces made for serving, staging, and quiet sculptural presence.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/consoles/bauffet%20from%20olive%20wood%20and%20black%20resin/IMG_20210801_223148.jpg","imageUrls":["/uploads/aon%20imgaes/consoles/bauffet%20from%20olive%20wood%20and%20black%20resin/IMG_20210801_223148.jpg"]},{"id":"consoles-oval-shape-console-from-beech-wood-and-canee","title":"Oval Shape Console From Beech Wood And Cane","category":"Dining Room","subcategory":"Buffet","material":"Beech wood, Cane weave","note":"Storage pieces made for serving, staging, and quiet sculptural presence.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/consoles/oval%20shape%20console%20from%20beech%20wood%20and%20canee/1733073774198.jpg","imageUrls":["/uploads/aon%20imgaes/consoles/oval%20shape%20console%20from%20beech%20wood%20and%20canee/1733073774198.jpg","/uploads/aon%20imgaes/consoles/oval%20shape%20console%20from%20beech%20wood%20and%20canee/1733073774243.jpg"]},{"id":"chairs-diablo-side-chair-from-tree-stump-made-from-sisso-wood-whole-tree","title":"Diablo Side Chair","category":"Dining Room","subcategory":"Chairs","material":"Sisso wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/DIABLO%20side%20chair%20from%20tree%20stump%20made%20from%20sisso%20wood%20whole%20tree/1-.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/DIABLO%20side%20chair%20from%20tree%20stump%20made%20from%20sisso%20wood%20whole%20tree/1-.jpg","/uploads/aon%20imgaes/chairs/DIABLO%20side%20chair%20from%20tree%20stump%20made%20from%20sisso%20wood%20whole%20tree/10-.jpg","/uploads/aon%20imgaes/chairs/DIABLO%20side%20chair%20from%20tree%20stump%20made%20from%20sisso%20wood%20whole%20tree/14-.jpg","/uploads/aon%20imgaes/chairs/DIABLO%20side%20chair%20from%20tree%20stump%20made%20from%20sisso%20wood%20whole%20tree/16-.jpg","/uploads/aon%20imgaes/chairs/DIABLO%20side%20chair%20from%20tree%20stump%20made%20from%20sisso%20wood%20whole%20tree/8-.jpg"]},{"id":"chairs-massive-beech-wood-chair","title":"Massive Beech Wood Chair","category":"Dining Room","subcategory":"Chairs","material":"Beech wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/0D2A0110.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/0D2A0110.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/0D2A5910.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/0D2A5911.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/0D2A5915.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/IMG_0003_2.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/IMG_0008.jpg","/uploads/aon%20imgaes/chairs/massive%20beech%20wood%20chair/IMG_0010.jpg"]},{"id":"chairs-massive-berry-wood-tree-side-chair","title":"Massive Berry Wood Tree Side Chair","category":"Dining Room","subcategory":"Chairs","material":"Berry wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/massive%20berry%20wood%20tree%20side%20chair/0D2A1168.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/massive%20berry%20wood%20tree%20side%20chair/0D2A1168.jpg","/uploads/aon%20imgaes/chairs/massive%20berry%20wood%20tree%20side%20chair/0D2A1174.jpg","/uploads/aon%20imgaes/chairs/massive%20berry%20wood%20tree%20side%20chair/0D2A1189.jpg","/uploads/aon%20imgaes/chairs/massive%20berry%20wood%20tree%20side%20chair/0D2A1194.jpg"]},{"id":"chairs-olive-wood-side-chair","title":"Olive Wood Side Chair","category":"Dining Room","subcategory":"Chairs","material":"Olive wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/olive%20wood%20side%20chair/0D2A1138.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/olive%20wood%20side%20chair/0D2A1138.jpg","/uploads/aon%20imgaes/chairs/olive%20wood%20side%20chair/0D2A1231.jpg","/uploads/aon%20imgaes/chairs/olive%20wood%20side%20chair/0D2A1235.jpg"]},{"id":"lighting-chandlier-from-tree-rings-with-live-edges","title":"Tree Ring Chandelier","category":"Dining Room","subcategory":"Lights","material":"Tree ring timber, Live edge detailing","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0007.jpg","imageUrls":["/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0007.jpg","/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0019.jpg","/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0028.jpg","/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0053.jpg"]},{"id":"mirrors-oak-tree-wood-mirror-2-meter","title":"Oak Mirror, Two-Meter Form","category":"Dining Room","subcategory":"Mirrors","material":"Oak wood, Mirror glass","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192037.jpg","imageUrls":["/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192037.jpg","/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192039.jpg","/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192123.jpg","/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192615.jpg","/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192617.jpg","/uploads/aon%20imgaes/mirrors/Oak%20tree%20wood%20mirror%202%20meter/IMG_20210519_192622.jpg"]},{"id":"mirrors-round-mirror-from-tree-trunks","title":"Round Mirror From Tree Trunks","category":"Dining Room","subcategory":"Mirrors","material":"Mirror glass, Tree trunk timber","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073772954.jpg","imageUrls":["/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073772954.jpg","/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073773006.jpg","/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073773059.jpg","/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073773109.jpg","/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073773157.jpg","/uploads/aon%20imgaes/mirrors/round%20mirror%20from%20tree%20trunks/1733073773208.jpg"]},{"id":"consoles-console-with-tree-trunks-and-flying-shelves","title":"Console With Tree Trunks And Flying Shelves","category":"Dining Room","subcategory":"Shelves","material":"Tree trunk timber","note":"Storage and display pieces treated as part of the room architecture.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772179.jpg","imageUrls":["/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772179.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772228.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772281.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772329.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772381.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772434.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772487.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772540.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772597.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772660.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772713.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772763.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772841.jpg","/uploads/aon%20imgaes/consoles/console%20with%20tree%20trunks%20and%20flying%20shelves/1733073772905.jpg"]},{"id":"dining-tables-acacia-wood-dining-table-with-metal-legs","title":"Acacia Wood Dining Table With Metal Legs","category":"Dining Room","subcategory":"Tables","material":"Acacia wood, Metal legs","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5873.jpg","imageUrls":["/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5873.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5878.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5882.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5901.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5903.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5919.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5927.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5950.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5981.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5996.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A5999.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/0D2A6010.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/IMG_0001_1.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/IMG_0002_2.jpg","/uploads/aon%20imgaes/dining%20tables/acacia%20wood%20dining%20table%20with%20metal%20legs/IMG_0008.jpg"]},{"id":"home-accessories-ashtray-from-tree-trunk","title":"Ashtray From Tree Trunk","category":"Dining Room","subcategory":"Tables","material":"Tree trunk timber","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/ashtray%20from%20tree%20trunk/IMG_0007.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/ashtray%20from%20tree%20trunk/IMG_0007.jpg"]},{"id":"kitchen-ware-cheese-platters-with-resin-from-walnut-wood","title":"Cheese Platters With Resin From Walnut Wood","category":"Dining Room","subcategory":"Tables","material":"Walnut wood, Resin detailing","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0011.jpg","imageUrls":["/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0011.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0014.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0015.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0020.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0023.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0033.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0038.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0041.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0047.jpg","/uploads/aon%20imgaes/kitchen%20ware/cheese%20platters%20with%20resin%20from%20walnut%20wood/IMG_0049.jpg"]},{"id":"kitchen-ware-cups-from-sisso-wood","title":"Cups From Sisso Wood","category":"Dining Room","subcategory":"Tables","material":"Sisso wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6417.jpg","imageUrls":["/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6417.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6422.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6424.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6427.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6436.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6437.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/0D2A6438.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/544A0093.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/544A0101.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/IMG_0031.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/IMG_0037.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/IMG_0038_1.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/IMG_0039.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/IMG_0041_1.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/IMG_0043.jpg","/uploads/aon%20imgaes/kitchen%20ware/cups%20from%20sisso%20wood/k.jpg"]},{"id":"dining-tables-dining-table-from-olive-wood-and-black-resin","title":"Dining Table From Olive Wood And Black Resin","category":"Dining Room","subcategory":"Tables","material":"Olive wood, Resin detailing","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dining%20tables/dining%20table%20from%20olive%20wood%20and%20black%20resin/IMG_20210801_223134.jpg","imageUrls":["/uploads/aon%20imgaes/dining%20tables/dining%20table%20from%20olive%20wood%20and%20black%20resin/IMG_20210801_223134.jpg"]},{"id":"dining-tables-massive-dinning-table-from-beech-tree-wood-with-live-tree-edges","title":"Live Edge Beech Dining Table","category":"Dining Room","subcategory":"Tables","material":"Beech wood, Live edge detailing","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/105-.jpg","imageUrls":["/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/105-.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/29-.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/3-.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/6U6A9947.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/6U6A9962.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/7-.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/IMG_0001-copy-2.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/IMG_0003-copy.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/IMG_0007.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20dinning%20table%20from%20beech%20tree%20wood%20with%20live%20tree%20edges/IMG_0026.jpg"]},{"id":"dining-tables-massive-cherry-tree-wood-with-glass-in-the-middle","title":"Massive Cherry Tree Wood With Glass In The Middle","category":"Dining Room","subcategory":"Tables","material":"Cherry wood, Glass","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0001_1.jpg","imageUrls":["/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0001_1.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0009.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0019.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0027-copy.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0027.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0052.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0056.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0058.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0059.jpg","/uploads/aon%20imgaes/dining%20tables/massive%20cherry%20tree%20wood%20with%20glass%20in%20the%20middle/IMG_0066.jpg"]},{"id":"kitchen-ware-sisso-wood-bowls-and-plates","title":"Sisso Wood Bowls And Plates","category":"Dining Room","subcategory":"Tables","material":"Sisso wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/6U6A0086.jpg","imageUrls":["/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/6U6A0086.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/6U6A0087.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/6U6A0089.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0002.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0005.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0006.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0008.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0009.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0011_1.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0012.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0016.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0017.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0053.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0054.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0055.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0056.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0057.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0062.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0063.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0064.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20bowls%20and%20plates/IMG_0069.jpg"]},{"id":"kitchen-ware-sisso-wood-cutting-board","title":"Sisso Wood Cutting Board","category":"Dining Room","subcategory":"Tables","material":"Sisso wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20cutting%20board/0D2A1270.jpg","imageUrls":["/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20cutting%20board/0D2A1270.jpg","/uploads/aon%20imgaes/kitchen%20ware/sisso%20wood%20cutting%20board/6U6A0070.jpg"]},{"id":"dining-tables-sisso-wood-dining-table","title":"Sisso Wood Dining Table","category":"Dining Room","subcategory":"Tables","material":"Sisso wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dining%20tables/sisso%20wood%20dining%20table/6U6A0319.jpg","imageUrls":["/uploads/aon%20imgaes/dining%20tables/sisso%20wood%20dining%20table/6U6A0319.jpg","/uploads/aon%20imgaes/dining%20tables/sisso%20wood%20dining%20table/6U6A0325.jpg","/uploads/aon%20imgaes/dining%20tables/sisso%20wood%20dining%20table/6U6A0327.jpg","/uploads/aon%20imgaes/dining%20tables/sisso%20wood%20dining%20table/6U6A0333.jpg"]},{"id":"kitchen-ware-tray-from-sisso-wood","title":"Tray From Sisso Wood","category":"Dining Room","subcategory":"Tables","material":"Sisso wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/kitchen%20ware/tray%20from%20sisso%20wood/544A0093.jpg","imageUrls":["/uploads/aon%20imgaes/kitchen%20ware/tray%20from%20sisso%20wood/544A0093.jpg","/uploads/aon%20imgaes/kitchen%20ware/tray%20from%20sisso%20wood/544A0101.jpg","/uploads/aon%20imgaes/kitchen%20ware/tray%20from%20sisso%20wood/544A0109.jpg","/uploads/aon%20imgaes/kitchen%20ware/tray%20from%20sisso%20wood/6U6A0202.jpg"]},{"id":"chairs-bench-from-massive-beech-tree-wood-slap","title":"Bench From Massive Beech Tree Wood Slab","category":"Outdoor Seating","subcategory":"Chairs","material":"Beech wood","note":"Seating shaped as sculptural presence as much as utility.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/3-.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/3-.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/6U6A9947.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/6U6A9962.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/7-.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/IMG_0001-copy-2.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/IMG_0007.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/IMG_0019.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20massive%20beech%20tree%20wood%20slap/IMG_0026.jpg"]},{"id":"chairs-bench-from-olive-tree-wood","title":"Bench From Olive Tree Wood","category":"Outdoor Seating","subcategory":"Chairs","material":"Olive wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/bench%20from%20olive%20tree%20wood/IMG_20210801_223134.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/bench%20from%20olive%20tree%20wood/IMG_20210801_223134.jpg","/uploads/aon%20imgaes/chairs/bench%20from%20olive%20tree%20wood/IMG_20210801_223138.jpg"]},{"id":"chairs-mini-sofa-with-old-flank-wood","title":"Mini Sofa in Reclaimed Plank Wood","category":"Outdoor Seating","subcategory":"Sofa","material":"Solid timber construction","note":"Lounge pieces with handcrafted structure and a softer room rhythm.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/mini%20sofa%20with%20old%20flank%20wood/0D2A5592.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/mini%20sofa%20with%20old%20flank%20wood/0D2A5592.jpg","/uploads/aon%20imgaes/chairs/mini%20sofa%20with%20old%20flank%20wood/0D2A5596.jpg","/uploads/aon%20imgaes/chairs/mini%20sofa%20with%20old%20flank%20wood/0D2A5600.jpg"]},{"id":"chairs-sofa-from-old-flank-wood","title":"Old Plank Wood Sofa","category":"Outdoor Seating","subcategory":"Sofa","material":"Solid timber construction","note":"Lounge pieces with handcrafted structure and a softer room rhythm.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/chairs/sofa%20from%20old%20flank%20wood/0D2A5509.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/sofa%20from%20old%20flank%20wood/0D2A5509.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20old%20flank%20wood/0D2A5515.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20old%20flank%20wood/0D2A5517.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20old%20flank%20wood/0D2A5518.jpg","/uploads/aon%20imgaes/chairs/sofa%20from%20old%20flank%20wood/0D2A5656.jpg"]},{"id":"home-accessories-indoor-pergola-from-pine-wood","title":"Indoor Pergola From Pine Wood","category":"Outdoor Seating","subcategory":"Tables","material":"Pine wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/indoor%20pergola%20from%20pine%20wood/1.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/indoor%20pergola%20from%20pine%20wood/1.jpg","/uploads/aon%20imgaes/home%20accessories/indoor%20pergola%20from%20pine%20wood/IMG_0032.jpg"]},{"id":"plant-pots-plant-pot-cover-from-massive-pine-wood","title":"Plant Pot Cover From Massive Pine Wood","category":"Outdoor Seating","subcategory":"Tables","material":"Pine wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A0041.jpg","imageUrls":["/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A0041.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A0046.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A0048.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A9907.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A9909.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pot%20cover%20from%20massive%20pine%20wood/6U6A9915.jpg"]},{"id":"plant-pots-plant-pots-from-massive-tree-trunks","title":"Planters from Massive Tree Trunks","category":"Outdoor Seating","subcategory":"Tables","material":"Tree trunk timber","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/0D2A0208.jpg","imageUrls":["/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/0D2A0208.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/0D2A0210.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/0D2A0212.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/0D2A0215.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/0D2A0343.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0094.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0173.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0174.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0183.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0198.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0221.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0231.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0238.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0249.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0253.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0265.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A0266.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A9882.jpg","/uploads/aon%20imgaes/plant%20pots/plant%20pots%20from%20massive%20tree%20trunks/6U6A9937.jpg"]},{"id":"plant-pots-square-plant-pots-from-pine-wood","title":"Square Plant Pots From Pine Wood","category":"Outdoor Seating","subcategory":"Tables","material":"Pine wood","note":"Surfaces built to let grain, proportion, and edge do the storytelling.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/plant%20pots/square%20plant%20pots%20from%20pine%20wood/6U6A9976.jpg","imageUrls":["/uploads/aon%20imgaes/plant%20pots/square%20plant%20pots%20from%20pine%20wood/6U6A9976.jpg","/uploads/aon%20imgaes/plant%20pots/square%20plant%20pots%20from%20pine%20wood/6U6A9989.jpg"]},{"id":"countar-tops-acacia-countar-top-sink","title":"Acacia Countertop Sink","category":"Restroom","subcategory":"Countertop","material":"Acacia wood","note":"Vanity surfaces where the live edge remains the focal gesture.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0153.jpg","imageUrls":["/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0153.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0160.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0166.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0172.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0174.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A0182.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A5850.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/0D2A5858.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773266.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773312.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773366.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773416.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773464.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773512.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773558.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773604.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773654.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773700.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773746.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773791.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773836.jpg","/uploads/aon%20imgaes/countar%20tops/acacia%20countar%20top%20sink/1733073773882.jpg"]},{"id":"countar-tops-contar-oak-wood-for-sink","title":"Contar Oak Vanity Top","category":"Restroom","subcategory":"Countertop","material":"Oak wood","note":"Vanity surfaces where the live edge remains the focal gesture.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/countar%20tops/contar%20oak%20wood%20for%20sink/0D2A0189.jpg","imageUrls":["/uploads/aon%20imgaes/countar%20tops/contar%20oak%20wood%20for%20sink/0D2A0189.jpg"]},{"id":"countar-tops-sisso-wood-counter-top","title":"Sisso Wood Countertop","category":"Restroom","subcategory":"Countertop","material":"Sisso wood","note":"Vanity surfaces where the live edge remains the focal gesture.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073773926.jpg","imageUrls":["/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073773926.jpg","/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073773973.jpg","/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073774019.jpg","/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073774064.jpg","/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073774109.jpg","/uploads/aon%20imgaes/countar%20tops/sisso%20wood%20counter%20top/1733073774152.jpg"]},{"id":"home-accessories-soap-holder-from-massive-olive-wood","title":"Soap Holder From Massive Olive Wood","category":"Restroom","subcategory":"Holders","material":"Olive wood","note":"Small accessories elevated through timber selection and hand finish.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0275.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0275.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0279.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0280.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0449.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0456.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0462.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0466.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0475.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0478.jpg","/uploads/aon%20imgaes/home%20accessories/soap%20holder%20from%20massive%20olive%20wood/0D2A0479.jpg"]},{"id":"beds-canee-bed-from-contar-oak-wood","title":"Cane Bed From Contar Oak Wood","category":"Bedroom","subcategory":"Beds","material":"Oak wood, Cane weave","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/beds/canee%20bed%20from%20contar%20oak%20wood/IMG-20240405-WA0076.jpg","imageUrls":["/uploads/aon%20imgaes/beds/canee%20bed%20from%20contar%20oak%20wood/IMG-20240405-WA0076.jpg","/uploads/aon%20imgaes/beds/canee%20bed%20from%20contar%20oak%20wood/IMG-20240405-WA0077.jpg"]},{"id":"beds-canee-with-massive-pitch-pine-wood-bed","title":"Cane With Massive Pitch Pine Wood Bed","category":"Bedroom","subcategory":"Beds","material":"Pitch pine, Cane weave","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/1.jpg","imageUrls":["/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/1.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/2.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/3.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/AE1A4443.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/IMG_0143.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/IMG_0144.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/IMG_0148.jpg","/uploads/aon%20imgaes/beds/canee%20with%20massive%20pitch%20pine%20wood%20bed/IMG_0152-2.jpg"]},{"id":"beds-massive-beech-wood-bed-with-bleached-white-color","title":"Massive Beech Wood Bed With Bleached White Color","category":"Bedroom","subcategory":"Beds","material":"Beech wood","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/beds/massive%20beech%20wood%20bed%20with%20bleached%20white%20color/1.jpg","imageUrls":["/uploads/aon%20imgaes/beds/massive%20beech%20wood%20bed%20with%20bleached%20white%20color/1.jpg","/uploads/aon%20imgaes/beds/massive%20beech%20wood%20bed%20with%20bleached%20white%20color/2.jpg","/uploads/aon%20imgaes/beds/massive%20beech%20wood%20bed%20with%20bleached%20white%20color/3.jpg","/uploads/aon%20imgaes/beds/massive%20beech%20wood%20bed%20with%20bleached%20white%20color/4.jpg","/uploads/aon%20imgaes/beds/massive%20beech%20wood%20bed%20with%20bleached%20white%20color/5.jpg"]},{"id":"beds-massive-oak-wood","title":"Massive Oak Wood","category":"Bedroom","subcategory":"Beds","material":"Oak wood","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/beds/massive%20Oak%20wood/0D2A5741.jpg","imageUrls":["/uploads/aon%20imgaes/beds/massive%20Oak%20wood/0D2A5741.jpg","/uploads/aon%20imgaes/beds/massive%20Oak%20wood/0D2A5785.jpg","/uploads/aon%20imgaes/beds/massive%20Oak%20wood/0D2A5806.jpg","/uploads/aon%20imgaes/beds/massive%20Oak%20wood/0D2A5809.jpg","/uploads/aon%20imgaes/beds/massive%20Oak%20wood/0D2A5815.jpg"]},{"id":"beds-massive-pine-wood-bed","title":"Massive Pine Wood Bed","category":"Bedroom","subcategory":"Beds","material":"Pine wood","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6246.jpg","imageUrls":["/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6246.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6248.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6249.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6255.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6258.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6264.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6279.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6280.jpg","/uploads/aon%20imgaes/beds/massive%20pine%20wood%20bed/0D2A6289.jpg"]},{"id":"beds-massive-pitch-pine-wood-bed-with-bamboo","title":"Massive Pitch Pine Wood Bed With Bamboo","category":"Bedroom","subcategory":"Beds","material":"Pitch pine, Bamboo","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/0D2A6124.jpg","imageUrls":["/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/0D2A6124.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/0D2A6127.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/0D2A6167.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/0D2A6169.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/0D2A6172.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/1.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/3.jpg","/uploads/aon%20imgaes/beds/massive%20pitch%20pine%20wood%20bed%20with%20bamboo/6.jpg"]},{"id":"entry-pictures","title":"Project Interior Overview","category":"Bedroom","subcategory":"Beds","material":"Solid timber construction","note":"Bed frames built around presence, tactile comfort, and grounded proportion.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169241995.jpg","imageUrls":["/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169241995.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169263115.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169269466.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169294766.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1662390464444.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1662390470195.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1662390476350.jpg"]},{"id":"chairs-corner-chair-shoe-rack-with-shelves","title":"Corner Chair Shoe Rack With Shelves","category":"Bedroom","subcategory":"Chairs","material":"Solid timber construction","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/corner%20chair%20shoe%20rack%20with%20shelves/0D2A0109.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/corner%20chair%20shoe%20rack%20with%20shelves/0D2A0109.jpg","/uploads/aon%20imgaes/chairs/corner%20chair%20shoe%20rack%20with%20shelves/0D2A0111.jpg","/uploads/aon%20imgaes/chairs/corner%20chair%20shoe%20rack%20with%20shelves/0D2A0122.jpg","/uploads/aon%20imgaes/chairs/corner%20chair%20shoe%20rack%20with%20shelves/0D2A0125.jpg"]},{"id":"chairs-rocking-chair-from-beech-wood","title":"Rocking Chair From Beech Wood","category":"Bedroom","subcategory":"Chairs","material":"Beech wood","note":"Seating shaped as sculptural presence as much as utility.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/chairs/rocking%20chair%20from%20beech%20wood/0D2A5580.jpg","imageUrls":["/uploads/aon%20imgaes/chairs/rocking%20chair%20from%20beech%20wood/0D2A5580.jpg","/uploads/aon%20imgaes/chairs/rocking%20chair%20from%20beech%20wood/0D2A5591.jpg"]},{"id":"comodes-2-drawer-comodes-from-pine-wood","title":"2 Drawer Commodes From Pine Wood","category":"Bedroom","subcategory":"Commode","material":"Pine wood","note":"Companion storage pieces made to bring warmth beside the bed.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/comodes/2%20drawer%20comodes%20from%20pine%20wood/3.jpg","imageUrls":["/uploads/aon%20imgaes/comodes/2%20drawer%20comodes%20from%20pine%20wood/3.jpg","/uploads/aon%20imgaes/comodes/2%20drawer%20comodes%20from%20pine%20wood/IMG_0123.jpg"]},{"id":"comodes-canee-with-contar-oak-wood-comode","title":"Cane With Contar Oak Wood Commode","category":"Bedroom","subcategory":"Commode","material":"Oak wood, Cane weave","note":"Companion storage pieces made to bring warmth beside the bed.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6172.jpg","imageUrls":["/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6172.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6174.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6215.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6216.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6219.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20contar%20oak%20wood%20comode/0D2A6225.jpg"]},{"id":"comodes-canee-with-massive-pine-wood-comode","title":"Cane With Massive Pine Wood Commode","category":"Bedroom","subcategory":"Commode","material":"Pine wood, Cane weave","note":"Companion storage pieces made to bring warmth beside the bed.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/comodes/canee%20with%20massive%20pine%20wood%20comode/IMG_0007.jpg","imageUrls":["/uploads/aon%20imgaes/comodes/canee%20with%20massive%20pine%20wood%20comode/IMG_0007.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20massive%20pine%20wood%20comode/IMG_0144.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20massive%20pine%20wood%20comode/IMG_0148.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20massive%20pine%20wood%20comode/IMG_0152-2.jpg","/uploads/aon%20imgaes/comodes/canee%20with%20massive%20pine%20wood%20comode/IMG_0152-2ss.jpg"]},{"id":"comodes-comode-from-old-train-rail-flank-wood","title":"Commode From Old Train Rail Plank Wood","category":"Bedroom","subcategory":"Commode","material":"Reclaimed rail plank wood","note":"Companion storage pieces made to bring warmth beside the bed.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5911.jpg","imageUrls":["/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5911.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5912.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5914.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5915.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5917.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5918.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5920.jpg","/uploads/aon%20imgaes/comodes/comode%20from%20old%20train%20rail%20flank%20wood/0D2A5921.jpg"]},{"id":"comodes-drawer-comode-from-contar-oak-wood","title":"Drawer Commode From Contar Oak Wood","category":"Bedroom","subcategory":"Commode","material":"Oak wood","note":"Companion storage pieces made to bring warmth beside the bed.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/comodes/drawer%20comode%20from%20contar%20oak%20wood/IMG-20240405-WA0072.jpg","imageUrls":["/uploads/aon%20imgaes/comodes/drawer%20comode%20from%20contar%20oak%20wood/IMG-20240405-WA0072.jpg","/uploads/aon%20imgaes/comodes/drawer%20comode%20from%20contar%20oak%20wood/IMG-20240405-WA0073.jpg"]},{"id":"comodes-massive-beech-wood-comode-with-1-drawer-in-bleached-white-color-comode","title":"Massive Beech Wood Commode With 1 Drawer In Bleached White Color Commode","category":"Bedroom","subcategory":"Commode","material":"Beech wood","note":"Companion storage pieces made to bring warmth beside the bed.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/comodes/massive%20beech%20wood%20comode%20with%201%20drawer%20in%20bleached%20white%20color%20comode/1.jpg","imageUrls":["/uploads/aon%20imgaes/comodes/massive%20beech%20wood%20comode%20with%201%20drawer%20in%20bleached%20white%20color%20comode/1.jpg","/uploads/aon%20imgaes/comodes/massive%20beech%20wood%20comode%20with%201%20drawer%20in%20bleached%20white%20color%20comode/3.jpg"]},{"id":"desk-beech-wood-desk-with-metal-legs","title":"Beech Wood Desk With Metal Legs","category":"Bedroom","subcategory":"Dressing Table","material":"Beech wood, Metal legs","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Desk/beech%20wood%20desk%20with%20metal%20legs/544A0216.jpg","imageUrls":["/uploads/aon%20imgaes/Desk/beech%20wood%20desk%20with%20metal%20legs/544A0216.jpg","/uploads/aon%20imgaes/Desk/beech%20wood%20desk%20with%20metal%20legs/544A0226.jpg","/uploads/aon%20imgaes/Desk/beech%20wood%20desk%20with%20metal%20legs/544A0228.jpg"]},{"id":"dresser-contar-oak-flying-dresser","title":"Contar Oak Flying Dresser","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dresser/contar%20oak%20flying%20dresser/IMG-20240405-WA0070.jpg","imageUrls":["/uploads/aon%20imgaes/dresser/contar%20oak%20flying%20dresser/IMG-20240405-WA0070.jpg","/uploads/aon%20imgaes/dresser/contar%20oak%20flying%20dresser/IMG-20240405-WA0084.jpg"]},{"id":"closet-contar-oak-wood-waredrope-and-dresser","title":"Contar Oak Wood Wardrobe And Dresser","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood","note":"Private rituals supported by pieces that balance utility and lightness.","featured":true,"coverImageUrl":"/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG-20240404-WA0044.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG-20240404-WA0044.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG-20240405-WA0059.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG-20240405-WA0078.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG-20240405-WA0079.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG_20220818_172921.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/IMG_20220818_172925.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20waredrope%20and%20dresser/WhatsApp%20Image%202024-04-04%20at%2023.54.33_db9939e3.jpg"]},{"id":"dresser-dresser-from-canee-and-contar-oak-wood","title":"Dresser From Cane And Contar Oak Wood","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood, Cane weave","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dresser/dresser%20from%20canee%20and%20contar%20oak%20wood/0D2A6233.jpg","imageUrls":["/uploads/aon%20imgaes/dresser/dresser%20from%20canee%20and%20contar%20oak%20wood/0D2A6233.jpg","/uploads/aon%20imgaes/dresser/dresser%20from%20canee%20and%20contar%20oak%20wood/0D2A6237.jpg","/uploads/aon%20imgaes/dresser/dresser%20from%20canee%20and%20contar%20oak%20wood/0D2A6241.jpg"]},{"id":"dresser-dresser-from-contar-oak-wood-and-canee","title":"Dresser From Contar Oak Wood And Cane","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood, Cane weave","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dresser/dresser%20from%20contar%20oak%20wood%20and%20canee/2.jpg","imageUrls":["/uploads/aon%20imgaes/dresser/dresser%20from%20contar%20oak%20wood%20and%20canee/2.jpg","/uploads/aon%20imgaes/dresser/dresser%20from%20contar%20oak%20wood%20and%20canee/4.jpg","/uploads/aon%20imgaes/dresser/dresser%20from%20contar%20oak%20wood%20and%20canee/5.jpg","/uploads/aon%20imgaes/dresser/dresser%20from%20contar%20oak%20wood%20and%20canee/IMG_0014.jpg"]},{"id":"dresser-dresser-from-oak-wood-with-special-design","title":"Dresser From Oak Wood With Special Design","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dresser/dresser%20from%20oak%20wood%20with%20special%20design/IMG_20220726_185124.jpg","imageUrls":["/uploads/aon%20imgaes/dresser/dresser%20from%20oak%20wood%20with%20special%20design/IMG_20220726_185124.jpg"]},{"id":"closet-dressing-from-contar-oak-wood","title":"Dressing From Contar Oak Wood","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/dressing%20from%20contar%20oak%20wood/IMG_20220726_190904.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/dressing%20from%20contar%20oak%20wood/IMG_20220726_190904.jpg","/uploads/aon%20imgaes/Closet/dressing%20from%20contar%20oak%20wood/IMG_20220726_190911.jpg"]},{"id":"desk-massive-acacia-tree-wood-desk","title":"Massive Acacia Tree Wood Desk","category":"Bedroom","subcategory":"Dressing Table","material":"Acacia wood","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0053.jpg","imageUrls":["/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0053.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0055.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0057.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0063.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0064.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0065.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/0D2A0067.jpg","/uploads/aon%20imgaes/Desk/massive%20acacia%20tree%20wood%20desk/1661174386982.jpg"]},{"id":"dresser-oak-contar-wood-dresser","title":"Oak Contar Wood Dresser","category":"Bedroom","subcategory":"Dressing Table","material":"Oak wood","note":"Private rituals supported by pieces that balance utility and lightness.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/dresser/oak%20contar%20wood%20dresser/0D2A0066.jpg","imageUrls":["/uploads/aon%20imgaes/dresser/oak%20contar%20wood%20dresser/0D2A0066.jpg","/uploads/aon%20imgaes/dresser/oak%20contar%20wood%20dresser/0D2A0084.jpg","/uploads/aon%20imgaes/dresser/oak%20contar%20wood%20dresser/0D2A0091.jpg","/uploads/aon%20imgaes/dresser/oak%20contar%20wood%20dresser/0D2A0135.jpg"]},{"id":"closet-hanging-ladder-from-tree-trunks","title":"Hanging Ladder From Tree Trunks","category":"Bedroom","subcategory":"Hanger","material":"Tree trunk timber","note":"Everyday hanging storage reworked with the character of solid timber.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/0D2A6316.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/0D2A6316.jpg","/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/0D2A6318.jpg","/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/0D2A6322.jpg","/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/1.jpg","/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/IMG_0101.jpg","/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/IMG_0136%20(1).jpg","/uploads/aon%20imgaes/Closet/hanging%20ladder%20from%20tree%20trunks/IMG_0136.jpg"]},{"id":"closet-pine-wood-hanger","title":"Pine Wood Hanger","category":"Bedroom","subcategory":"Hanger","material":"Pine wood","note":"Everyday hanging storage reworked with the character of solid timber.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6133.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6133.jpg","/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6144.jpg","/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6154.jpg","/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6166.jpg","/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6210.jpg","/uploads/aon%20imgaes/Closet/pine%20wood%20hanger/0D2A6212.jpg"]},{"id":"home-accessories-side-lamp-from-live-tree-trunk","title":"Live Trunk Side Lamp","category":"Bedroom","subcategory":"Lights","material":"Tree trunk timber","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/1%20highres.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/1%20highres.jpg","/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/1%20lowres.jpg","/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/2%20highres.jpg","/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/2%20lowres.jpg","/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/3%20highres.jpg","/uploads/aon%20imgaes/home%20accessories/side%20lamp%20from%20live%20tree%20trunk/3%20lowres.jpg"]},{"id":"mirrors-rectangelar-shape-mirror","title":"Rectangular Mirror","category":"Bedroom","subcategory":"Mirrors","material":"Mirror glass","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/rectangelar%20shape%20mirror/1733073774198.jpg","imageUrls":["/uploads/aon%20imgaes/mirrors/rectangelar%20shape%20mirror/1733073774198.jpg","/uploads/aon%20imgaes/mirrors/rectangelar%20shape%20mirror/1733073774243.jpg"]},{"id":"closet-contar-oak-wood-wardrope","title":"Contar Oak Wood Wardrobe","category":"Bedroom","subcategory":"Wardrobe","material":"Oak wood","note":"Full-height storage treated as architecture rather than mere cabinetry.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20wardrope/IMG-20240404-WA0043.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20wardrope/IMG-20240404-WA0043.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20wardrope/IMG-20240405-WA0068.jpg","/uploads/aon%20imgaes/Closet/contar%20oak%20wood%20wardrope/WhatsApp%20Image%202024-04-04%20at%2023.54.31_efdb1190.jpg"]},{"id":"closet-oak-contar-wood-waredrope","title":"Oak Contar Wood Wardrobe","category":"Bedroom","subcategory":"Wardrobe","material":"Oak wood","note":"Full-height storage treated as architecture rather than mere cabinetry.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/oak%20contar%20wood%20waredrope/0D2A0057.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/oak%20contar%20wood%20waredrope/0D2A0057.jpg","/uploads/aon%20imgaes/Closet/oak%20contar%20wood%20waredrope/0D2A0066.jpg","/uploads/aon%20imgaes/Closet/oak%20contar%20wood%20waredrope/0D2A0084.jpg","/uploads/aon%20imgaes/Closet/oak%20contar%20wood%20waredrope/0D2A0090.jpg","/uploads/aon%20imgaes/Closet/oak%20contar%20wood%20waredrope/0D2A0125.jpg"]},{"id":"closet-waredrope-from-massive-oak-wood","title":"Wardrobe From Massive Oak Wood","category":"Bedroom","subcategory":"Wardrobe","material":"Oak wood","note":"Full-height storage treated as architecture rather than mere cabinetry.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/waredrope%20from%20massive%20oak%20wood/0D2A5739.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/waredrope%20from%20massive%20oak%20wood/0D2A5739.jpg","/uploads/aon%20imgaes/Closet/waredrope%20from%20massive%20oak%20wood/0D2A5815.jpg","/uploads/aon%20imgaes/Closet/waredrope%20from%20massive%20oak%20wood/0D2A5818.jpg","/uploads/aon%20imgaes/Closet/waredrope%20from%20massive%20oak%20wood/0D2A5836.jpg","/uploads/aon%20imgaes/Closet/waredrope%20from%20massive%20oak%20wood/0D2A5842.jpg"]},{"id":"closet-white-wardrope-with-canee","title":"White Wardrobe With Cane","category":"Bedroom","subcategory":"Wardrobe","material":"Cane weave","note":"Full-height storage treated as architecture rather than mere cabinetry.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0060.jpg","imageUrls":["/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0060.jpg","/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0061.jpg","/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0063.jpg","/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0074.jpg","/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0075.jpg","/uploads/aon%20imgaes/Closet/white%20wardrope%20with%20canee/IMG-20240405-WA0084.jpg"]},{"id":"home-accessories-coaster-from-resin-and-olive-wood","title":"Coaster From Resin And Olive Wood","category":"Home Accessories","subcategory":"Coasters","material":"Olive wood, Resin detailing","note":"Small tabletop objects shaped to bring tactility and calm to intimate details.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0235.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0235.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0252.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0254.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0258.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0261.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0264.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0270.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20olive%20wood/0D2A0271.jpg"]},{"id":"home-accessories-coaster-from-resin-and-walnut-wood","title":"Coaster From Resin And Walnut Wood","category":"Home Accessories","subcategory":"Coasters","material":"Walnut wood, Resin detailing","note":"Small tabletop objects shaped to bring tactility and calm to intimate details.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0422.jpg","imageUrls":["/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0422.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0424.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0427.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0429.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0434.jpg","/uploads/aon%20imgaes/home%20accessories/coaster%20from%20resin%20and%20walnut%20wood/0D2A0439.jpg"]},{"id":"lighting-bamboo-lighting","title":"Bamboo Lighting","category":"Home Accessories","subcategory":"Lights","material":"Bamboo, Integrated lighting","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/bamboo%20lighting/1661174386942.jpg","imageUrls":["/uploads/aon%20imgaes/lighting/bamboo%20lighting/1661174386942.jpg","/uploads/aon%20imgaes/lighting/bamboo%20lighting/1661174494924.jpg","/uploads/aon%20imgaes/lighting/bamboo%20lighting/1661174494962.jpg","/uploads/aon%20imgaes/lighting/bamboo%20lighting/1661174494997.jpg","/uploads/aon%20imgaes/lighting/bamboo%20lighting/1661174495034.jpg","/uploads/aon%20imgaes/lighting/bamboo%20lighting/FB_IMG_1660169294766.jpg"]},{"id":"lighting-floor-lamp-from-massive-acacia-tree-wood","title":"Floor Lamp From Massive Acacia Tree Wood","category":"Home Accessories","subcategory":"Lights","material":"Acacia wood","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174388279.jpg","imageUrls":["/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174388279.jpg","/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174388392.jpg","/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174495179.jpg","/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174495401.jpg","/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174495655.jpg","/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174495692.jpg","/uploads/aon%20imgaes/lighting/floor%20lamp%20from%20massive%20acacia%20tree%20wood/1661174861833.jpg"]},{"id":"lighting-floor-tree-backlight-lamp","title":"Floor Tree Backlight Lamp","category":"Home Accessories","subcategory":"Lights","material":"Integrated lighting","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/floor%20tree%20backlight%20lamp/0D2A5535.jpg","imageUrls":["/uploads/aon%20imgaes/lighting/floor%20tree%20backlight%20lamp/0D2A5535.jpg"]},{"id":"lighting-floor-tree-lamp","title":"Floor Tree Lamp","category":"Home Accessories","subcategory":"Lights","material":"Solid timber construction","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/floor%20tree%20lamp/0D2A5603.jpg","imageUrls":["/uploads/aon%20imgaes/lighting/floor%20tree%20lamp/0D2A5603.jpg","/uploads/aon%20imgaes/lighting/floor%20tree%20lamp/0D2A5613.jpg"]},{"id":"lighting-flank-wood-from-old-train-rails-with-spot-lights","title":"Rail Plank Spotlight Beam","category":"Home Accessories","subcategory":"Lights","material":"Reclaimed rail plank wood, Integrated lighting","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1439.JPG","imageUrls":["/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1439.JPG","/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1440.JPG","/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1442.JPG","/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1444.JPG","/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1449.JPG","/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1450.JPG","/uploads/aon%20imgaes/lighting/flank%20wood%20from%20old%20train%20rails%20with%20spot%20lights/0D2A1457.JPG"]},{"id":"lighting-tree-ring-wood-shape-with-lighting","title":"Tree Ring Light Form","category":"Home Accessories","subcategory":"Lights","material":"Tree ring timber, Integrated lighting","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/tree%20ring%20wood%20shape%20with%20lighting/0D2A1386.JPG","imageUrls":["/uploads/aon%20imgaes/lighting/tree%20ring%20wood%20shape%20with%20lighting/0D2A1386.JPG","/uploads/aon%20imgaes/lighting/tree%20ring%20wood%20shape%20with%20lighting/0D2A1395.JPG","/uploads/aon%20imgaes/lighting/tree%20ring%20wood%20shape%20with%20lighting/0D2A1416.JPG","/uploads/aon%20imgaes/lighting/tree%20ring%20wood%20shape%20with%20lighting/0D2A1417.JPG","/uploads/aon%20imgaes/lighting/tree%20ring%20wood%20shape%20with%20lighting/0D2A1425.JPG"]},{"id":"lighting-wall-mount-beech-wood-back-light-plate","title":"Wall Mount Beech Wood Back Light Plate","category":"Home Accessories","subcategory":"Lights","material":"Beech wood","note":"Lighting documented as atmosphere first, object second.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/lighting/wall%20mount%20beech%20wood%20back%20light%20plate/1661174495179.jpg","imageUrls":["/uploads/aon%20imgaes/lighting/wall%20mount%20beech%20wood%20back%20light%20plate/1661174495179.jpg","/uploads/aon%20imgaes/lighting/wall%20mount%20beech%20wood%20back%20light%20plate/1661174495401.jpg","/uploads/aon%20imgaes/lighting/wall%20mount%20beech%20wood%20back%20light%20plate/1661174495512.jpg","/uploads/aon%20imgaes/lighting/wall%20mount%20beech%20wood%20back%20light%20plate/1661174495583.jpg","/uploads/aon%20imgaes/lighting/wall%20mount%20beech%20wood%20back%20light%20plate/1661174861799.jpg"]},{"id":"mirrors-frameless-mirror-from-irregular-shape","title":"Frameless Mirror From Irregular Shape","category":"Home Accessories","subcategory":"Mirrors","material":"Mirror glass","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/0D2A0153.jpg","imageUrls":["/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/0D2A0153.jpg","/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/0D2A0160.jpg","/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/0D2A0166.jpg","/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/0D2A0189.jpg","/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/355eee9b9bdfb5f1d417adb7971fc72c.jpg","/uploads/aon%20imgaes/mirrors/frameless%20mirror%20from%20irregular%20shape/FB_IMG_1662390484641.jpg"]},{"id":"mirrors-mirror-from-massive-beech-tree-wood-with-live-tree-edges-2-meters","title":"Mirror From Massive Beech Tree Wood With Live Tree Edges 2 Meters","category":"Home Accessories","subcategory":"Mirrors","material":"Beech wood, Mirror glass, Live edge detailing","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/mirror%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges%202%20meters/1%20.jpg","imageUrls":["/uploads/aon%20imgaes/mirrors/mirror%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges%202%20meters/1%20.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges%202%20meters/2%20.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20massive%20beech%20tree%20wood%20with%20live%20tree%20edges%202%20meters/IMG-20200927-WA0004.jpg"]},{"id":"mirrors-mirror-from-old-train-rail-flank-wood","title":"Mirror From Old Train Rail Plank Wood","category":"Home Accessories","subcategory":"Mirrors","material":"Mirror glass, Reclaimed rail plank wood","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5927.jpg","imageUrls":["/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5927.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5928.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5937.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5956.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5957.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A5984.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A6295.jpg","/uploads/aon%20imgaes/mirrors/mirror%20from%20old%20train%20rail%20flank%20wood/0D2A6308.jpg"]},{"id":"mirrors-massive-olive-wood-mirror-door","title":"Olive Wood Mirror Door","category":"Home Accessories","subcategory":"Mirrors","material":"Olive wood, Mirror glass","note":"Reflective forms framed to feel tactile, grounded, and room-specific.","featured":false,"coverImageUrl":"/uploads/aon%20imgaes/mirrors/massive%20olive%20wood%20mirror%20door/0D2A0045-01.jpeg","imageUrls":["/uploads/aon%20imgaes/mirrors/massive%20olive%20wood%20mirror%20door/0D2A0045-01.jpeg","/uploads/aon%20imgaes/mirrors/massive%20olive%20wood%20mirror%20door/0D2A0045.jpg","/uploads/aon%20imgaes/mirrors/massive%20olive%20wood%20mirror%20door/0D2A6002.jpg","/uploads/aon%20imgaes/mirrors/massive%20olive%20wood%20mirror%20door/0D2A6005.jpg","/uploads/aon%20imgaes/mirrors/massive%20olive%20wood%20mirror%20door/0D2A6011.jpg"]}],"categories":[{"name":"Living Room","eyebrow":"Gallery I","description":"Gathering pieces shaped around conversation, texture, and the slower rhythm of lived-in rooms.","subcategories":["Shelves","Tables","TV Unit","Chairs","Sofa","Wall Artwork"]},{"name":"Dining Room","eyebrow":"Gallery II","description":"Tables, storage, and lighting composed for hosting, ceremony, and the quiet architecture of meals.","subcategories":["Shelves","Tables","Benches","Chairs","Buffet"]},{"name":"Outdoor Seating","eyebrow":"Gallery III","description":"Open-air pieces documented through benches, lounge seating, lighting, planters, and relaxed exterior gatherings.","subcategories":["Chairs","Tables","Sofa"]},{"name":"Restroom","eyebrow":"Gallery IV","description":"Compact interventions where material choice, silhouette, and restraint do most of the visual work.","subcategories":["Holders","Countertop"]},{"name":"Bedroom","eyebrow":"Gallery V","description":"Private-room pieces arranged around storage, tactility, and a sense of calm that lasts beyond trends.","subcategories":["Wardrobe","Commode","Beds","Dressing Table","Chairs","Hanger"]},{"name":"Home Accessories","eyebrow":"Gallery VI","description":"Smaller objects and accents where craft, detail, and material expression take priority over scale.","subcategories":["Coasters","Lights","Mirrors"]}]};
        const galleryEditorEl = document.getElementById('gallery-piece-editor');
        const galleryAddPieceButton = document.getElementById('gallery-add-piece');
        const galleryExpandAllButton = document.getElementById('gallery-expand-all');
        const galleryCollapseAllButton = document.getElementById('gallery-collapse-all');
        const galleryPieceSearchInput = document.getElementById('gallery-piece-search');
        const galleryPieceCategoryFilter = document.getElementById('gallery-piece-category-filter');
        const galleryPieceCountEl = document.getElementById('gallery-piece-count');
        const galleryForm = document.getElementById('gallery-content-form');
        const galleryPiecesJsonField = document.getElementById('gallery-pieces-json');
        const journalEditorData = {"posts":[{"id":"art-of-wood-selection","slug":"art-of-wood-selection","title":"The Art of Wood Selection","excerpt":"How the studio chooses timber by grain, live edge, structure, and the quieter character each board brings into a room.","category":"Materials","publishedAt":"2026-04-15","featured":true,"published":true,"coverImageUrl":"/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1120.jpg","coverImageAlt":"Olive wood coffee table surface with resin detail","galleryImageUrls":["/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1120.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1127.jpg","/uploads/aon%20imgaes/coffee%20tables/olive%20wood%20with%20resin%20coffee%20table/0D2A1128.jpg"],"body":"## Beginning with the board\n\nThe studio rarely begins with a sketch alone. It begins by standing with the timber itself and asking what kind of presence it already holds.\n\nSome pieces ask for calm continuity, where grain runs evenly and lets proportion speak first. Others ask for contrast, movement, and a more visible conversation between edge, figure, and natural irregularity.\n\n> A beautiful board is not always the right board. The right board is the one whose character belongs to the room and to the object being made.\n\nFor tables and statement pieces, the live edge can remain part of the final language. For cabinetry and more architectural forms, consistency and structure often matter more than drama.\n\n- Grain direction shapes how the eye moves across the piece.\n- Density and stability influence where timber can be used confidently.\n- Color variation affects how quiet or expressive the final object feels.\n\nSelection is less about perfection and more about intention. The goal is always to let the material feel inevitable once the piece is complete."},{"id":"designing-for-longevity","slug":"designing-for-longevity","title":"Designing for Longevity","excerpt":"Why proportion, restraint, and tactile materials matter more than trends when making pieces meant to stay in a space for years.","category":"Philosophy","publishedAt":"2026-04-08","featured":true,"published":true,"coverImageUrl":"/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169263115.jpg","coverImageAlt":"Interior entry composition featuring crafted wood elements","galleryImageUrls":["/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169263115.jpg","/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169241995.jpg","/uploads/aon%20imgaes/entry%20pictures/544A0007.jpg"],"body":"## Beyond the season\n\nPieces made for a home should feel quieter with time, not louder. Longevity is rarely created by chasing novelty. It is built through proportion, honest materials, and an understanding of how a room will be lived in.\n\nWhen a design is too eager to impress, it often becomes tired quickly. When it is balanced, tactile, and grounded, it becomes part of the architecture of daily life.\n\nThe studio thinks about longevity through repetition of use: how a hand meets an edge, how light falls across a finish, how a silhouette feels after months rather than moments.\n\n> The ambition is not to make something trendy. It is to make something that still feels right when the room around it changes.\n\nDesigning for longevity means removing what is unnecessary until the material, proportion, and presence are enough on their own."},{"id":"traditional-joinery-methods","slug":"traditional-joinery-methods","title":"Traditional Joinery Methods","excerpt":"A look at how older joinery logic still informs contemporary studio work, from strength and repairability to visual calm.","category":"Technique","publishedAt":"2026-03-28","featured":false,"published":true,"coverImageUrl":"/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0007.jpg","coverImageAlt":"Crafted lighting detail suspended with handmade structure","galleryImageUrls":["/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0007.jpg","/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0017.jpg","/uploads/aon%20imgaes/lighting/chandlier%20from%20tree%20rings%20with%20live%20edges/544A0026.jpg"],"body":"## Structure that can be understood\n\nTraditional joinery still matters because it solves more than structure. It also shapes the visual calm of a piece. When elements meet honestly, the object feels settled.\n\nOlder methods such as housed joints, mortise-and-tenon logic, and carefully concealed mechanical support continue to guide the studio's work, even when the final expression is contemporary.\n\nJoinery is also about repairability and respect for movement. Timber shifts with climate and age. Good construction anticipates that instead of fighting it.\n\n- A visible joint can become a design statement when used with restraint.\n- A concealed joint can preserve visual quiet while still honoring structure.\n- Both approaches depend on understanding the material rather than forcing it.\n\nTechnique should never feel decorative for its own sake. It should make the final piece feel composed, trustworthy, and lasting."}]};
        const journalEditorEl = document.getElementById('journal-post-editor');
        const journalAddPostButton = document.getElementById('journal-add-post');
        const journalExpandAllButton = document.getElementById('journal-expand-all');
        const journalCollapseAllButton = document.getElementById('journal-collapse-all');
        const journalPostSearchInput = document.getElementById('journal-post-search');
        const journalPostStatusFilter = document.getElementById('journal-post-status-filter');
        const journalPostCountEl = document.getElementById('journal-post-count');
        const journalForm = document.getElementById('journal-content-form');
        const journalPostsJsonField = document.getElementById('journal-posts-json');
        const journalDeviceUploadInput = document.getElementById('journal-device-upload');
        const journalUploadToSelectedButton = document.getElementById('journal-upload-to-selected');
        const journalUploadToCoverButton = document.getElementById('journal-upload-to-cover');
        const journalUploadToGalleryButton = document.getElementById('journal-upload-to-gallery');
        const galleryCategories = Array.isArray(galleryEditorData && galleryEditorData.categories)
          ? galleryEditorData.categories
          : [];
        let galleryPiecesState = Array.isArray(galleryEditorData && galleryEditorData.pieces)
          ? galleryEditorData.pieces.map(normalizeEditorPiece)
          : [];
        let journalPostsState = Array.isArray(journalEditorData && journalEditorData.posts)
          ? journalEditorData.posts.map(normalizeJournalEditorPost)
          : [];
        let cachedUploadEntries = [];
        let currentUploadsPath = '';
        let lastFocusedUploadField = null;

        function escapeHtmlValue(value) {
          return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        }

        function slugifyPieceId(value) {
          return String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }

        function getCategoryConfig(categoryName) {
          return galleryCategories.find(function (category) {
            return category && category.name === categoryName;
          }) || galleryCategories[0] || null;
        }

        function getSubcategoryOptions(categoryName, selectedValue) {
          const category = getCategoryConfig(categoryName);
          const subcategories = category && Array.isArray(category.subcategories) ? category.subcategories : [];

          return subcategories
            .map(function (subcategory) {
              const selected = subcategory === selectedValue ? 'selected' : '';
              return '<option value="' + escapeHtmlValue(subcategory) + '" ' + selected + '>' + escapeHtmlValue(subcategory) + '</option>';
            })
            .join('');
        }

        function categoryOptionsMarkup(selectedValue) {
          return galleryCategories
            .map(function (category) {
              const selected = category.name === selectedValue ? 'selected' : '';
              return '<option value="' + escapeHtmlValue(category.name) + '" ' + selected + '>' + escapeHtmlValue(category.name) + '</option>';
            })
            .join('');
        }

        function normalizeEditorPiece(piece) {
          const fallbackCategory = galleryCategories[0] || { name: 'Living Room', subcategories: ['Tables'] };
          const category = getCategoryConfig(piece && piece.category) || fallbackCategory;
          const imageUrls = Array.isArray(piece && piece.imageUrls)
            ? piece.imageUrls.map(function (url) { return String(url || '').trim(); }).filter(Boolean)
            : [];
          const requestedCoverImageUrl =
            piece && typeof piece.coverImageUrl === 'string'
              ? piece.coverImageUrl.trim()
              : '';
          const coverImageUrl =
            imageUrls.includes(requestedCoverImageUrl)
              ? requestedCoverImageUrl
              : (imageUrls[0] || '');

          return {
            id: typeof (piece && piece.id) === 'string' ? piece.id.trim() : '',
            title: typeof (piece && piece.title) === 'string' ? piece.title.trim() : '',
            category: category.name,
            subcategory:
              typeof (piece && piece.subcategory) === 'string' && category.subcategories.includes(piece.subcategory)
                ? piece.subcategory
                : category.subcategories[0],
            material: typeof (piece && piece.material) === 'string' ? piece.material.trim() : '',
            note: typeof (piece && piece.note) === 'string' ? piece.note.trim() : '',
            featured: piece && piece.featured === true,
            coverImageUrl: coverImageUrl,
            imageUrls: imageUrls,
          };
        }

        function isMeaningfulPiece(piece) {
          return Boolean(piece && (piece.title || piece.material || piece.note || (Array.isArray(piece.imageUrls) && piece.imageUrls.length > 0)));
        }

        function getGalleryFilterState() {
          const searchValue =
            galleryPieceSearchInput && typeof galleryPieceSearchInput.value === 'string'
              ? galleryPieceSearchInput.value.trim().toLowerCase()
              : '';
          const categoryValue =
            galleryPieceCategoryFilter && typeof galleryPieceCategoryFilter.value === 'string'
              ? galleryPieceCategoryFilter.value
              : 'all';

          return {
            searchValue: searchValue,
            categoryValue: categoryValue,
          };
        }

        function pieceMatchesFilters(piece, filters) {
          if (filters.categoryValue && filters.categoryValue !== 'all' && piece.category !== filters.categoryValue) {
            return false;
          }

          if (!filters.searchValue) {
            return true;
          }

          const haystack = [
            piece.title,
            piece.material,
            piece.note,
            piece.category,
            piece.subcategory,
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(filters.searchValue);
        }

        function buildPiecePreviewMarkup(imageUrls, coverImageUrl) {
          if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return '<div class="gallery-piece-preview-empty">No images linked yet.</div>';
          }

          const previewCards = imageUrls
            .slice(0, 6)
            .map(function (url, index) {
              const safeUrl = escapeHtmlValue(url);
              const isCover = url === coverImageUrl;
              return '<div class="gallery-piece-preview' + (isCover ? ' is-cover' : '') + '">' +
                '<img src="' + safeUrl + '" alt="Preview image ' + (index + 1) + '" loading="lazy" />' +
                '<div class="gallery-piece-preview-actions">' +
                  '<span class="gallery-piece-preview-label">' + (isCover ? 'Cover frame' : 'Frame ' + (index + 1)) + '</span>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-set-cover="' + safeUrl + '">' + (isCover ? 'Selected' : 'Use as cover') + '</button>' +
                '</div>' +
              '</div>';
            })
            .join('');

          const overflowBadge = imageUrls.length > 6
            ? '<div class="gallery-piece-preview-count">+' + (imageUrls.length - 6) + ' more image' + (imageUrls.length - 6 === 1 ? '' : 's') + '</div>'
            : '';

          return previewCards + overflowBadge;
        }

        function readPiecesFromDom() {
          if (!galleryEditorEl) return [];

          return Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]'))
            .map(function (card) {
              const pieceIndex = Number(card.getAttribute('data-piece-index'));
              const title = card.querySelector('[data-field="title"]');
              const category = card.querySelector('[data-field="category"]');
              const subcategory = card.querySelector('[data-field="subcategory"]');
              const material = card.querySelector('[data-field="material"]');
              const note = card.querySelector('[data-field="note"]');
              const featured = card.querySelector('[data-field="featured"]');
              const coverImageUrl = card.querySelector('[data-field="coverImageUrl"]');
              const imageUrls = card.querySelector('[data-field="imageUrls"]');
              const idInput = card.querySelector('[data-field="id"]');

              const normalized = normalizeEditorPiece({
                id: idInput && typeof idInput.value === 'string' ? idInput.value.trim() : '',
                title: title && typeof title.value === 'string' ? title.value.trim() : '',
                category: category && typeof category.value === 'string' ? category.value.trim() : '',
                subcategory: subcategory && typeof subcategory.value === 'string' ? subcategory.value.trim() : '',
                material: material && typeof material.value === 'string' ? material.value.trim() : '',
                note: note && typeof note.value === 'string' ? note.value.trim() : '',
                featured: Boolean(featured && featured.checked),
                coverImageUrl:
                  coverImageUrl && typeof coverImageUrl.value === 'string'
                    ? coverImageUrl.value.trim()
                    : '',
                imageUrls:
                  imageUrls && typeof imageUrls.value === 'string'
                    ? imageUrls.value.split(/?
/).map(function (line) { return line.trim(); }).filter(Boolean)
                    : [],
              });

              normalized.id = normalized.id || slugifyPieceId(normalized.title);
              return {
                pieceIndex: pieceIndex,
                piece: normalized,
              };
            })
            .filter(function (entry) {
              return Number.isInteger(entry.pieceIndex) && entry.pieceIndex >= 0;
            });
        }

        function syncVisiblePiecesIntoState() {
          readPiecesFromDom().forEach(function (entry) {
            galleryPiecesState[entry.pieceIndex] = entry.piece;
          });
        }

        function updateGalleryPieceCount(visibleCount) {
          if (!galleryPieceCountEl) {
            return;
          }

          const totalCount = galleryPiecesState.length;
          galleryPieceCountEl.textContent =
            visibleCount === totalCount
              ? totalCount + ' piece' + (totalCount === 1 ? '' : 's')
              : visibleCount + ' of ' + totalCount + ' pieces';
        }

        function renderGalleryEditor() {
          if (!galleryEditorEl) return;

          const filters = getGalleryFilterState();
          const visiblePieces = galleryPiecesState
            .map(function (piece, pieceIndex) {
              return {
                pieceIndex: pieceIndex,
                piece: normalizeEditorPiece(piece),
              };
            })
            .filter(function (entry) {
              return pieceMatchesFilters(entry.piece, filters);
            });

          updateGalleryPieceCount(visiblePieces.length);

          if (visiblePieces.length === 0) {
            galleryEditorEl.innerHTML = '<div class="empty-editor-state">No pieces match the current search or room filter.</div>';
            return;
          }

          galleryEditorEl.innerHTML = visiblePieces
            .map(function (entry, visibleIndex) {
              const normalized = normalizeEditorPiece(entry.piece);
              const imageCount = normalized.imageUrls.length;
              const summaryTitle = normalized.title || 'Untitled piece';
              const summaryMeta = normalized.category + ' / ' + normalized.subcategory + ' / ' + imageCount + ' image' + (imageCount === 1 ? '' : 's');
              const previewMarkup = buildPiecePreviewMarkup(normalized.imageUrls, normalized.coverImageUrl);

              return '<details class="gallery-piece-card" data-piece-card data-piece-index="' + entry.pieceIndex + '" ' + (visibleIndex < 1 ? 'open' : '') + '>' +
                '<summary>' +
                  '<div>' +
                    '<strong>' + escapeHtmlValue(summaryTitle) + '</strong>' +
                    '<div class="gallery-piece-meta">' + escapeHtmlValue(summaryMeta) + (normalized.featured ? ' / featured' : '') + '</div>' +
                  '</div>' +
                  '<button type="button" class="danger-button" data-remove-piece="' + entry.pieceIndex + '">Remove</button>' +
                '</summary>' +
                '<div class="gallery-piece-body">' +
                  '<div class="piece-grid">' +
                    '<input type="hidden" data-field="id" value="' + escapeHtmlValue(normalized.id) + '" />' +
                    '<input type="hidden" data-field="coverImageUrl" value="' + escapeHtmlValue(normalized.coverImageUrl) + '" />' +
                    '<p><label>Title<br /><input data-field="title" value="' + escapeHtmlValue(normalized.title) + '" /></label></p>' +
                    '<p><label>Material<br /><input data-field="material" value="' + escapeHtmlValue(normalized.material) + '" /></label></p>' +
                    '<p><label>Category<br /><select data-field="category">' + categoryOptionsMarkup(normalized.category) + '</select></label></p>' +
                    '<p><label>Subcategory<br /><select data-field="subcategory">' + getSubcategoryOptions(normalized.category, normalized.subcategory) + '</select></label></p>' +
                    '<p class="full"><label>Note<br /><textarea data-field="note" style="min-height:120px;">' + escapeHtmlValue(normalized.note) + '</textarea></label></p>' +
                    '<div class="full"><label>Cover Image</label><p class="upload-help" style="margin:0 0 0.75rem 0;">Choose which frame leads on the homepage, room cards, and archive viewer entry point.</p><div class="gallery-piece-preview-strip">' + previewMarkup + '</div></div>' +
                    '<p class="full"><label>Image URLs (one per line)<br /><textarea data-field="imageUrls" style="min-height:150px;">' + escapeHtmlValue(normalized.imageUrls.join('\n')) + '</textarea></label></p>' +
                    '<p class="full"><label class="checkbox-row"><input type="checkbox" data-field="featured" ' + (normalized.featured ? 'checked' : '') + ' /> Featured on homepage portfolio section</label></p>' +
                  '</div>' +
                '</div>' +
              '</details>';
            })
            .join('');

          lastFocusedUploadField = null;
        }

        function normalizeJournalEditorPost(post) {
          const title = post && typeof post.title === 'string' ? post.title.trim() : '';
          const slug = post && typeof post.slug === 'string' ? post.slug.trim() : '';
          const coverImageUrl =
            post && typeof post.coverImageUrl === 'string'
              ? post.coverImageUrl.trim()
              : '';
          const galleryImageUrls = Array.isArray(post && post.galleryImageUrls)
            ? post.galleryImageUrls.map(function (url) { return String(url || '').trim(); }).filter(Boolean)
            : [];

          return {
            id: post && typeof post.id === 'string' ? post.id.trim() : '',
            slug: slug || slugifyPieceId(title),
            title: title,
            excerpt: post && typeof post.excerpt === 'string' ? post.excerpt.trim() : '',
            category: post && typeof post.category === 'string' ? post.category.trim() : '',
            publishedAt: post && typeof post.publishedAt === 'string' ? post.publishedAt.trim() : new Date().toISOString().slice(0, 10),
            featured: post && post.featured === true,
            published: !post || post.published !== false,
            coverImageUrl: coverImageUrl,
            coverImageAlt: post && typeof post.coverImageAlt === 'string' ? post.coverImageAlt.trim() : '',
            galleryImageUrls: Array.from(new Set([coverImageUrl].concat(galleryImageUrls).filter(Boolean))),
            body: post && typeof post.body === 'string' ? post.body.trim() : '',
          };
        }

        function getJournalReadingTime(bodyText) {
          const wordCount = String(bodyText || '')
            .trim()
            .split(/s+/)
            .filter(Boolean)
            .length;

          return Math.max(2, Math.ceil(wordCount / 180));
        }

        function buildJournalPreviewCardMarkup(post) {
          const safeCover = escapeHtmlValue(post.coverImageUrl || '');
          const previewImageMarkup = safeCover
            ? '<img src="' + safeCover + '" alt="' + escapeHtmlValue(post.coverImageAlt || post.title || 'Preview image') + '" loading="lazy" />'
            : '<div class="gallery-piece-preview-empty" style="min-height:9rem; display:flex; align-items:center; justify-content:center;">No cover image yet.</div>';
          const previewHref = post.slug ? '/journal/' + encodeURIComponent(post.slug) : '';
          const previewMeta = [
            post.category || 'Uncategorized',
            post.publishedAt || 'Undated',
            getJournalReadingTime(post.body) + ' min read',
            post.published ? 'Published' : 'Draft'
          ].join(' / ');

          return '<div class="journal-preview-card">' +
            '<div>' + previewImageMarkup + '</div>' +
            '<div>' +
              '<div class="journal-preview-kicker">' + escapeHtmlValue(previewMeta) + (post.featured ? ' / featured' : '') + '</div>' +
              '<div class="journal-preview-title">' + escapeHtmlValue(post.title || 'Untitled article') + '</div>' +
              '<p class="journal-preview-copy">' + escapeHtmlValue(post.excerpt || 'Add a short excerpt to shape the preview card and article introduction.') + '</p>' +
              (previewHref
                ? '<a class="journal-preview-link" href="' + previewHref + '" target="_blank" rel="noopener">Open Preview</a>'
                : '<span class="journal-preview-link" style="opacity:0.52;">Add a slug to preview</span>') +
            '</div>' +
          '</div>';
        }

        function isMeaningfulJournalPost(post) {
          return Boolean(post && (post.title || post.excerpt || post.body || post.coverImageUrl));
        }

        function getJournalFilterState() {
          const searchValue =
            journalPostSearchInput && typeof journalPostSearchInput.value === 'string'
              ? journalPostSearchInput.value.trim().toLowerCase()
              : '';
          const statusValue =
            journalPostStatusFilter && typeof journalPostStatusFilter.value === 'string'
              ? journalPostStatusFilter.value
              : 'all';

          return {
            searchValue: searchValue,
            statusValue: statusValue,
          };
        }

        function journalPostMatchesFilters(post, filters) {
          if (filters.statusValue === 'published' && !post.published) {
            return false;
          }

          if (filters.statusValue === 'draft' && post.published) {
            return false;
          }

          if (!filters.searchValue) {
            return true;
          }

          const haystack = [
            post.title,
            post.category,
            post.slug,
            post.excerpt,
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(filters.searchValue);
        }

        function buildJournalPreviewMarkup(post) {
          const images = Array.isArray(post.galleryImageUrls) ? post.galleryImageUrls.filter(Boolean) : [];
          if (images.length === 0) {
            return '<div class="gallery-piece-preview-empty">No images linked yet.</div>';
          }

          return images
            .slice(0, 6)
            .map(function (url, index) {
              const safeUrl = escapeHtmlValue(url);
              const isCover = url === post.coverImageUrl;
              return '<div class="gallery-piece-preview' + (isCover ? ' is-cover' : '') + '">' +
                '<img src="' + safeUrl + '" alt="Preview image ' + (index + 1) + '" loading="lazy" />' +
                '<div class="gallery-piece-preview-actions">' +
                  '<span class="gallery-piece-preview-label">' + (isCover ? 'Cover frame' : 'Frame ' + (index + 1)) + '</span>' +
                  '<button type="button" class="ghost-button gallery-piece-preview-button" data-set-journal-cover="' + safeUrl + '">' + (isCover ? 'Selected' : 'Use as cover') + '</button>' +
                '</div>' +
              '</div>';
            })
            .join('');
        }

        function readJournalPostsFromDom() {
          if (!journalEditorEl) return [];

          return Array.from(journalEditorEl.querySelectorAll('[data-journal-card]'))
            .map(function (card) {
              const postIndex = Number(card.getAttribute('data-post-index'));
              const getFieldValue = function (field) {
                const input = card.querySelector('[data-field="' + field + '"]');
                return input && typeof input.value === 'string' ? input.value.trim() : '';
              };
              const galleryImageUrlsField = card.querySelector('[data-field="galleryImageUrls"]');
              const featuredField = card.querySelector('[data-field="featured"]');
              const publishedField = card.querySelector('[data-field="published"]');

              return {
                postIndex: postIndex,
                post: normalizeJournalEditorPost({
                  id: getFieldValue('id'),
                  slug: getFieldValue('slug'),
                  title: getFieldValue('title'),
                  excerpt: getFieldValue('excerpt'),
                  category: getFieldValue('category'),
                  publishedAt: getFieldValue('publishedAt'),
                  featured: Boolean(featuredField && featuredField.checked),
                  published: Boolean(publishedField && publishedField.checked),
                  coverImageUrl: getFieldValue('coverImageUrl'),
                  coverImageAlt: getFieldValue('coverImageAlt'),
                  galleryImageUrls:
                    galleryImageUrlsField && typeof galleryImageUrlsField.value === 'string'
                      ? galleryImageUrlsField.value.split(/?
/).map(function (line) { return line.trim(); }).filter(Boolean)
                      : [],
                  body: getFieldValue('body'),
                }),
              };
            })
            .filter(function (entry) {
              return Number.isInteger(entry.postIndex) && entry.postIndex >= 0;
            });
        }

        function syncVisibleJournalPostsIntoState() {
          readJournalPostsFromDom().forEach(function (entry) {
            journalPostsState[entry.postIndex] = entry.post;
          });
        }

        function updateJournalPostCount(visibleCount) {
          if (!journalPostCountEl) {
            return;
          }

          const totalCount = journalPostsState.length;
          journalPostCountEl.textContent =
            visibleCount === totalCount
              ? totalCount + ' post' + (totalCount === 1 ? '' : 's')
              : visibleCount + ' of ' + totalCount + ' posts';
        }

        function renderJournalEditor() {
          if (!journalEditorEl) return;

          const filters = getJournalFilterState();
          const visiblePosts = journalPostsState
            .map(function (post, postIndex) {
              return {
                postIndex: postIndex,
                post: normalizeJournalEditorPost(post),
              };
            })
            .filter(function (entry) {
              return journalPostMatchesFilters(entry.post, filters);
            });

          updateJournalPostCount(visiblePosts.length);

          if (visiblePosts.length === 0) {
            journalEditorEl.innerHTML = '<div class="empty-editor-state">No journal posts match the current search or status filter.</div>';
            return;
          }

          journalEditorEl.innerHTML = visiblePosts
            .map(function (entry, visibleIndex) {
              const normalized = normalizeJournalEditorPost(entry.post);
              const summaryTitle = normalized.title || 'Untitled article';
              const summaryMeta =
                normalized.category + ' / ' + normalized.publishedAt + (normalized.published ? ' / published' : ' / draft');
              const previewMarkup = buildJournalPreviewMarkup(normalized);
              const previewCardMarkup = buildJournalPreviewCardMarkup(normalized);

              return '<details class="gallery-piece-card" data-journal-card data-post-index="' + entry.postIndex + '" ' + (visibleIndex < 1 ? 'open' : '') + '>' +
                '<summary>' +
                  '<div>' +
                    '<strong>' + escapeHtmlValue(summaryTitle) + '</strong>' +
                    '<div class="gallery-piece-meta">' + escapeHtmlValue(summaryMeta) + (normalized.featured ? ' / featured' : '') + '</div>' +
                  '</div>' +
                  '<div class="journal-summary-actions">' +
                    '<button type="button" class="ghost-button" data-move-journal-post="' + entry.postIndex + '" data-direction="-1">Up</button>' +
                    '<button type="button" class="ghost-button" data-move-journal-post="' + entry.postIndex + '" data-direction="1">Down</button>' +
                    '<button type="button" class="ghost-button" data-duplicate-journal-post="' + entry.postIndex + '">Duplicate</button>' +
                    '<button type="button" class="danger-button" data-remove-journal-post="' + entry.postIndex + '">Remove</button>' +
                  '</div>' +
                '</summary>' +
                '<div class="gallery-piece-body">' +
                  '<div class="piece-grid">' +
                    '<input type="hidden" data-field="id" value="' + escapeHtmlValue(normalized.id) + '" />' +
                    '<p><label>Title<br /><input data-field="title" value="' + escapeHtmlValue(normalized.title) + '" /></label></p>' +
                    '<p><label>Slug<br /><input data-field="slug" value="' + escapeHtmlValue(normalized.slug) + '" /></label></p>' +
                    '<p><label>Category<br /><input data-field="category" value="' + escapeHtmlValue(normalized.category) + '" /></label></p>' +
                    '<p><label>Publish Date<br /><input type="date" data-field="publishedAt" value="' + escapeHtmlValue(normalized.publishedAt) + '" /></label></p>' +
                    '<div class="full">' + previewCardMarkup + '</div>' +
                    '<p class="full"><label>Excerpt<br /><textarea data-field="excerpt" style="min-height:110px;">' + escapeHtmlValue(normalized.excerpt) + '</textarea></label></p>' +
                    '<div class="journal-field-stack"><label>Cover Image URL<br /><input data-field="coverImageUrl" data-upload-mode="replace" value="' + escapeHtmlValue(normalized.coverImageUrl) + '" /></label><div class="journal-upload-row"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-journal-upload-file="cover" /><button type="button" class="ghost-button" data-upload-journal-field="cover">Upload Cover</button><button type="button" class="ghost-button" data-focus-upload-field="coverImageUrl">Use Library</button></div></div>' +
                    '<p><label>Cover Image Alt<br /><input data-field="coverImageAlt" value="' + escapeHtmlValue(normalized.coverImageAlt) + '" /></label></p>' +
                    '<div class="full"><label>Image Selection</label><p class="upload-help" style="margin:0 0 0.75rem 0;">Choose the frame that leads the article, cards, and journal preview.</p><div class="gallery-piece-preview-strip">' + previewMarkup + '</div></div>' +
                    '<div class="full journal-field-stack"><label>Gallery Images (one per line)<br /><textarea data-field="galleryImageUrls" data-upload-mode="append" style="min-height:140px;">' + escapeHtmlValue(normalized.galleryImageUrls.join('\n')) + '</textarea></label><div class="journal-upload-row"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" data-journal-upload-file="gallery" multiple /><button type="button" class="ghost-button" data-upload-journal-field="gallery">Upload To Gallery</button><button type="button" class="ghost-button" data-focus-upload-field="galleryImageUrls">Use Library</button></div></div>' +
                    '<div class="full"><label>Body</label><div class="body-tools"><button type="button" class="ghost-button" data-insert-body-snippet="heading">Heading</button><button type="button" class="ghost-button" data-insert-body-snippet="quote">Quote</button><button type="button" class="ghost-button" data-insert-body-snippet="list">List</button><button type="button" class="ghost-button" data-insert-body-snippet="break">Paragraph Break</button></div><textarea data-field="body" style="min-height:240px;">' + escapeHtmlValue(normalized.body) + '</textarea></div>' +
                    '<p><label class="checkbox-row"><input type="checkbox" data-field="published" ' + (normalized.published ? 'checked' : '') + ' /> Published on public site</label></p>' +
                    '<p><label class="checkbox-row"><input type="checkbox" data-field="featured" ' + (normalized.featured ? 'checked' : '') + ' /> Feature in homepage journal preview</label></p>' +
                  '</div>' +
                '</div>' +
              '</details>';
            })
            .join('');

          lastFocusedUploadField = null;
        }

        function setStatus(message, isError) {
          if (!statusEl) return;
          statusEl.textContent = message;
          statusEl.style.color = isError ? '#b91c1c' : '#6b7280';
        }

        function normalizeUploadsPath(value) {
          return String(value || '')
            .replace(/\/g, '/')
            .split('/')
            .map(function (segment) { return segment.trim(); })
            .filter(Boolean)
            .join('/');
        }

        function getParentUploadsPath(value) {
          const normalized = normalizeUploadsPath(value);
          if (!normalized) {
            return '';
          }

          const segments = normalized.split('/');
          segments.pop();
          return segments.join('/');
        }

        function syncUploadsFolderInput() {
          if (uploadsFolderInput instanceof HTMLInputElement) {
            uploadsFolderInput.value = currentUploadsPath;
          }
        }

        function renderUploadsPathbar() {
          if (!uploadsPathbarEl) {
            return;
          }

          const normalized = normalizeUploadsPath(currentUploadsPath);
          const segments = normalized ? normalized.split('/') : [];
          let html = '<div class="uploads-current-path">';
          html += '<button type="button" class="uploads-breadcrumb' + (segments.length === 0 ? ' is-current' : '') + '" data-open-folder="">Root</button>';

          let runningPath = '';
          segments.forEach(function (segment, index) {
            runningPath = runningPath ? runningPath + '/' + segment : segment;
            html += '<span class="uploads-breadcrumb-separator">/</span>';
            html += '<button type="button" class="uploads-breadcrumb' + (index === segments.length - 1 ? ' is-current' : '') + '" data-open-folder="' + escapeHtmlValue(runningPath) + '">' + escapeHtmlValue(segment) + '</button>';
          });

          html += '</div>';
          uploadsPathbarEl.innerHTML = html;
        }

        function renderUploads() {
          if (!uploadsListEl) return;

          const searchTerm =
            uploadsSearchInput && typeof uploadsSearchInput.value === 'string'
              ? uploadsSearchInput.value.trim().toLowerCase()
              : '';

          const visibleUploads = cachedUploadEntries
            .filter(function (item) {
              if (!searchTerm) {
                return true;
              }

              const searchableText = [
                item && typeof item.name === 'string' ? item.name.toLowerCase() : '',
                item && typeof item.path === 'string' ? item.path.toLowerCase() : '',
                item && typeof item.folder === 'string' ? item.folder.toLowerCase() : '',
                item && typeof item.url === 'string' ? item.url.toLowerCase() : '',
              ].join(' ');

              return searchableText.includes(searchTerm);
            })
            .slice(0, 80);

          if (visibleUploads.length === 0) {
            uploadsListEl.innerHTML = searchTerm
              ? '<p class="upload-help">No files or folders match that search in this location.</p>'
              : '<p class="upload-help">This folder is empty.</p>';
            return;
          }

          uploadsListEl.innerHTML = visibleUploads
            .map(function (item) {
              if (item && item.type === 'directory') {
                const safePath = escapeHtmlValue(String(item.path || ''));
                const folderLabel = item.folder ? '<div class="upload-card-folder">' + escapeHtmlValue(item.folder) + '</div>' : '<div class="upload-card-folder">Root</div>';
                return '<div class="upload-card upload-folder-card">' +
                  '<div>' +
                    '<div class="upload-folder-icon">DIR</div>' +
                    folderLabel +
                    '<div class="upload-card-title">' + escapeHtmlValue(String(item.name || 'Untitled folder')) + '</div>' +
                    '<div class="upload-card-meta">' + escapeHtmlValue(String(item.itemCount || 0)) + ' item' + (Number(item.itemCount) === 1 ? '' : 's') + '</div>' +
                  '</div>' +
                  '<div class="upload-card-actions">' +
                    '<button type="button" class="ghost-button" data-open-folder="' + safePath + '">Open</button>' +
                    '<button type="button" class="ghost-button" data-delete-folder="' + safePath + '">Delete</button>' +
                  '</div>' +
                '</div>';
              }

              const safePath = escapeHtmlValue(String(item.path || ''));
              const safeUrl = escapeHtmlValue(String(item.url || ''));
              const previewSrc = '/api/uploads/image?path=' + encodeURIComponent(String(item.path || ''));
              const folderLabel = item.folder ? '<div class="upload-card-folder">' + escapeHtmlValue(item.folder) + '</div>' : '<div class="upload-card-folder">Root</div>';
              return '<div class="upload-card">' +
                '<img src="' + previewSrc + '" alt="Uploaded image" loading="lazy" />' +
                folderLabel +
                '<div class="upload-card-title">' + escapeHtmlValue(String(item.name || 'Untitled file')) + '</div>' +
                '<a href="' + safeUrl + '" target="_blank" rel="noopener">' + safeUrl + '</a>' +
                '<div class="upload-card-meta">' + escapeHtmlValue(String(item.mimeType || 'file')) + '</div>' +
                '<div class="upload-card-actions">' +
                  '<button type="button" class="ghost-button" data-copy-upload="' + safeUrl + '">Copy URL</button>' +
                  '<button type="button" class="ghost-button" data-insert-upload="' + safeUrl + '">Insert</button>' +
                  '<button type="button" class="ghost-button" data-delete-upload="' + safePath + '">Delete</button>' +
                '</div>' +
              '</div>';
            })
            .join('');
        }

        async function refreshUploads(nextPath) {
          if (!uploadsListEl) return;

          try {
            currentUploadsPath = normalizeUploadsPath(nextPath !== undefined ? nextPath : currentUploadsPath);
            syncUploadsFolderInput();
            renderUploadsPathbar();

            const query = currentUploadsPath
              ? '?path=' + encodeURIComponent(currentUploadsPath)
              : '';
            const response = await fetch('/api/uploads/tree' + query, {
              cache: 'no-store',
              credentials: 'same-origin',
            });
            if (!response.ok) {
              throw new Error('Failed to load uploads.');
            }

            const uploads = await response.json();
            cachedUploadEntries = Array.isArray(uploads) ? uploads : [];
            renderUploads();
          } catch {
            uploadsListEl.innerHTML = '<p class="upload-help">Failed to load uploaded images.</p>';
          }
        }

        async function fileToBase64(file) {
          return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () {
              const result = typeof reader.result === 'string' ? reader.result : '';
              const commaIndex = result.indexOf(',');
              if (commaIndex < 0) {
                reject(new Error('Invalid image data.'));
                return;
              }

              resolve(result.slice(commaIndex + 1));
            };
            reader.onerror = function () {
              reject(new Error('Could not read file.'));
            };
            reader.readAsDataURL(file);
          });
        }

        function setInlineUploadStatus(targetField, message, state) {
          if (!targetField) {
            return;
          }

          const statusNode = document.querySelector('[data-upload-status-for="' + targetField + '"]');
          if (!(statusNode instanceof HTMLElement)) {
            return;
          }

          statusNode.textContent = message || '';
          statusNode.classList.remove('is-error', 'is-success');
          if (state === 'error') {
            statusNode.classList.add('is-error');
          } else if (state === 'success') {
            statusNode.classList.add('is-success');
          }
        }

        function triggerFieldChange(field) {
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }

        function insertUploadUrlIntoField(field, url, mode) {
          if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
            return;
          }

          const uploadMode = mode || field.getAttribute('data-upload-mode') || 'append';
          const currentValue = String(field.value || '').trim();
          field.value = uploadMode === 'replace'
            ? url
            : currentValue ? currentValue + '\n' + url : url;
          triggerFieldChange(field);
          field.focus();
        }

        async function uploadSingleImage(file) {
          const base64Data = await fileToBase64(file);
          const targetFolder = normalizeUploadsPath(uploadsFolderInput && uploadsFolderInput instanceof HTMLInputElement ? uploadsFolderInput.value.trim() : currentUploadsPath);
          const response = await fetch('/api/uploads/files', {
            method: 'POST',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              folder: targetFolder || undefined,
              mimeType: file.type,
              base64Data: base64Data,
            }),
          });

          const payload = await response.json();
          if (!response.ok || !payload || typeof payload.url !== 'string') {
            throw new Error(payload && payload.message ? payload.message : 'Upload failed.');
          }

          return payload.url;
        }

        async function uploadMultipleImages(files) {
          const uploadedUrls = [];

          for (const file of files) {
            uploadedUrls.push(await uploadSingleImage(file));
          }

          return uploadedUrls;
        }

        function getContentImageUploadElements(form, targetField) {
          if (!(form instanceof HTMLFormElement) || !targetField) {
            return null;
          }

          const row = form.querySelector('.upload-row');
          const fileInput = row ? row.querySelector('input.image-file-input[data-target-field="' + targetField + '"]') : null;
          const targetInput = form.elements.namedItem(targetField);
          const uploadButton = row ? row.querySelector('.image-upload-button[data-target-field="' + targetField + '"]') : null;

          return {
            row: row,
            fileInput: fileInput,
            targetInput: targetInput,
            uploadButton: uploadButton,
          };
        }

        async function uploadContentImageForField(form, targetField, options) {
          const elements = getContentImageUploadElements(form, targetField);
          const fileInput = elements && elements.fileInput;
          const targetInput = elements && elements.targetInput;
          const uploadButton = elements && elements.uploadButton;
          const selectedFile =
            fileInput instanceof HTMLInputElement && fileInput.files
              ? fileInput.files[0]
              : null;

          if (!selectedFile || !(targetInput instanceof HTMLInputElement || targetInput instanceof HTMLTextAreaElement)) {
            setInlineUploadStatus(targetField, 'Select an image first.', 'error');
            throw new Error('Select an image first.');
          }

          const buttonWasDisabled = uploadButton instanceof HTMLButtonElement ? uploadButton.disabled : false;
          const originalButtonLabel =
            uploadButton instanceof HTMLButtonElement
              ? uploadButton.textContent
              : null;

          try {
            if (uploadButton instanceof HTMLButtonElement) {
              uploadButton.disabled = true;
              uploadButton.textContent = 'Uploading...';
            }

            setInlineUploadStatus(targetField, 'Uploading image...', 'pending');
            setStatus('Uploading image...', false);

            const uploadedUrl = await uploadSingleImage(selectedFile);
            targetInput.value = uploadedUrl;
            triggerFieldChange(targetInput);
            targetInput.focus();

            if (fileInput instanceof HTMLInputElement && options && options.clearSelection !== false) {
              fileInput.value = '';
            }

            setInlineUploadStatus(targetField, 'Image uploaded. Save this section to publish it.', 'success');
            setStatus('Image uploaded. URL inserted into field.', false);
            await refreshUploads(normalizeUploadsPath(uploadsFolderInput && uploadsFolderInput instanceof HTMLInputElement ? uploadsFolderInput.value : currentUploadsPath));
            return uploadedUrl;
          } finally {
            if (uploadButton instanceof HTMLButtonElement) {
              uploadButton.disabled = buttonWasDisabled;
              uploadButton.textContent = originalButtonLabel || 'Upload Image';
            }
          }
        }

        document.querySelectorAll('.image-upload-button').forEach(function (button) {
          button.addEventListener('click', async function (event) {
            event.preventDefault();
            const targetField = button.getAttribute('data-target-field');
            if (!targetField) return;

            const form = button.closest('form');
            if (!(form instanceof HTMLFormElement)) {
              return;
            }

            try {
              await uploadContentImageForField(form, targetField, { clearSelection: true });
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setInlineUploadStatus(targetField, message, 'error');
              setStatus(message, true);
            }
          });
        });

        document.querySelectorAll('.image-file-input').forEach(function (input) {
          input.addEventListener('change', function () {
            if (!(input instanceof HTMLInputElement)) {
              return;
            }

            const targetField = input.getAttribute('data-target-field');
            if (!targetField) {
              return;
            }

            const hasSelection = Boolean(input.files && input.files.length);
            setInlineUploadStatus(
              targetField,
              hasSelection ? 'Image selected. Press Upload Image to insert it.' : '',
              hasSelection ? 'success' : 'pending',
            );
          });
        });

        document.querySelectorAll('form[data-image-upload-form]').forEach(function (formNode) {
          formNode.addEventListener('submit', async function (event) {
            if (!(formNode instanceof HTMLFormElement)) {
              return;
            }

            if (formNode.dataset.uploadingBeforeSubmit === 'true') {
              return;
            }

            const targetField = formNode.getAttribute('data-image-upload-target');
            if (!targetField) {
              return;
            }

            const elements = getContentImageUploadElements(formNode, targetField);
            const fileInput = elements && elements.fileInput;
            const hasPendingFile =
              fileInput instanceof HTMLInputElement &&
              Boolean(fileInput.files && fileInput.files.length);

            if (!hasPendingFile) {
              return;
            }

            event.preventDefault();

            try {
              await uploadContentImageForField(formNode, targetField, { clearSelection: true });
              formNode.dataset.uploadingBeforeSubmit = 'true';
              formNode.submit();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setInlineUploadStatus(targetField, message, 'error');
              setStatus(message, true);
            } finally {
              delete formNode.dataset.uploadingBeforeSubmit;
            }
          });
        });

        document.addEventListener('click', async function (event) {
          if (!(event.target instanceof Element)) {
            return;
          }

          const openFolderButton = event.target.closest('[data-open-folder]');
          if (openFolderButton) {
            event.preventDefault();
            await refreshUploads(openFolderButton.getAttribute('data-open-folder') || '');
            return;
          }

          const deleteButton = event.target.closest('[data-delete-upload]');
          if (deleteButton) {
            event.preventDefault();
            const targetPath = deleteButton.getAttribute('data-delete-upload');
            if (!targetPath) {
              setStatus('Unable to identify file to delete.', true);
              return;
            }

            try {
              setStatus('Deleting file...', false);
              const response = await fetch('/api/uploads/files?path=' + encodeURIComponent(targetPath), {
                method: 'DELETE',
                cache: 'no-store',
                credentials: 'same-origin',
              });

              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload && payload.message ? payload.message : 'Delete failed.');
              }

              setStatus('File deleted. Refreshing folder...', false);
              await refreshUploads(currentUploadsPath);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Delete failed.';
              setStatus(message, true);
            }
            return;
          }

          const deleteFolderButton = event.target.closest('[data-delete-folder]');
          if (deleteFolderButton) {
            event.preventDefault();
            const targetPath = deleteFolderButton.getAttribute('data-delete-folder');
            if (!targetPath) {
              setStatus('Unable to identify folder to delete.', true);
              return;
            }

            try {
              setStatus('Deleting folder...', false);
              const response = await fetch('/api/uploads/folders?path=' + encodeURIComponent(targetPath), {
                method: 'DELETE',
                cache: 'no-store',
                credentials: 'same-origin',
              });

              if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload && payload.message ? payload.message : 'Delete failed.');
              }

              const currentNormalized = normalizeUploadsPath(currentUploadsPath);
              const deletedNormalized = normalizeUploadsPath(targetPath);
              const shouldMoveUp = currentNormalized === deletedNormalized || currentNormalized.startsWith(deletedNormalized + '/');
              setStatus('Folder deleted. Refreshing folder...', false);
              await refreshUploads(shouldMoveUp ? getParentUploadsPath(deletedNormalized) : currentUploadsPath);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Delete failed.';
              setStatus(message, true);
            }
          }
        });

        if (createUploadFolderButton) {
          createUploadFolderButton.addEventListener('click', async function () {
            const folderName = normalizeUploadsPath(uploadsFolderInput && uploadsFolderInput instanceof HTMLInputElement ? uploadsFolderInput.value.trim() : currentUploadsPath);
            if (!folderName) {
              setStatus('Enter a folder path first.', true);
              return;
            }

            try {
              setStatus('Creating folder...', false);
              const response = await fetch('/api/uploads/folders', {
                method: 'POST',
                cache: 'no-store',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: folderName }),
              });

              const payload = await response.json();
              if (!response.ok || !payload || typeof payload.path !== 'string') {
                throw new Error(payload && payload.message ? payload.message : 'Could not create folder.');
              }

              setStatus('Folder created: ' + payload.path, false);
              await refreshUploads(payload.path);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Could not create folder.';
              setStatus(message, true);
            }
          });
        }

        if (uploadsGoRootButton) {
          uploadsGoRootButton.addEventListener('click', function () {
            refreshUploads('');
          });
        }

        if (uploadsGoParentButton) {
          uploadsGoParentButton.addEventListener('click', function () {
            refreshUploads(getParentUploadsPath(currentUploadsPath));
          });
        }

        if (galleryEditorEl && galleryForm && galleryPiecesJsonField) {
          renderGalleryEditor();

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const removeButton = event.target.closest('[data-remove-piece]');
            if (!removeButton) return;

            event.preventDefault();
            syncVisiblePiecesIntoState();
            const index = Number(removeButton.getAttribute('data-remove-piece'));
            galleryPiecesState = galleryPiecesState.filter(function (_piece, pieceIndex) {
              return pieceIndex !== index;
            });
            renderGalleryEditor();
          });

          galleryEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const coverButton = event.target.closest('[data-set-cover]');
            if (!coverButton) {
              return;
            }

            event.preventDefault();
            const card = coverButton.closest('[data-piece-card]');
            const coverImageUrlField = card && card.querySelector('[data-field="coverImageUrl"]');
            const nextCoverUrl = coverButton.getAttribute('data-set-cover') || '';

            if (!(coverImageUrlField instanceof HTMLInputElement) || !nextCoverUrl) {
              return;
            }

            coverImageUrlField.value = nextCoverUrl;
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
            setStatus('Cover image updated for this piece.', false);
          });

          galleryEditorEl.addEventListener('focusin', function (event) {
            const target = event.target;
            if (
              target instanceof HTMLTextAreaElement &&
              target.getAttribute('data-field') === 'imageUrls'
            ) {
              lastFocusedUploadField = target;
            }
          });

          galleryEditorEl.addEventListener('change', function (event) {
            const target = event.target;
            if (!(target instanceof HTMLSelectElement) || target.getAttribute('data-field') !== 'category') {
              if (
                target instanceof HTMLTextAreaElement &&
                target.getAttribute('data-field') === 'imageUrls'
              ) {
                syncVisiblePiecesIntoState();
                renderGalleryEditor();
              } else if (
                target instanceof HTMLInputElement &&
                target.getAttribute('data-field') === 'featured'
              ) {
                syncVisiblePiecesIntoState();
                renderGalleryEditor();
              }
              return;
            }

            const card = target.closest('[data-piece-card]');
            const subcategorySelect = card && card.querySelector('[data-field="subcategory"]');
            if (!(subcategorySelect instanceof HTMLSelectElement)) {
              return;
            }

            const category = getCategoryConfig(target.value);
            const nextSubcategory = category && Array.isArray(category.subcategories) ? category.subcategories[0] : '';
            subcategorySelect.innerHTML = getSubcategoryOptions(target.value, nextSubcategory);
            syncVisiblePiecesIntoState();
            renderGalleryEditor();
          });

          if (galleryAddPieceButton) {
            galleryAddPieceButton.addEventListener('click', function () {
              syncVisiblePiecesIntoState();
              const fallbackCategory = galleryCategories[0] || { name: 'Living Room', subcategories: ['Tables'] };
              galleryPiecesState.push(normalizeEditorPiece({
                id: '',
                title: '',
                category: fallbackCategory.name,
                subcategory: fallbackCategory.subcategories[0],
                material: '',
                note: '',
                featured: false,
                coverImageUrl: '',
                imageUrls: [],
              }));
              renderGalleryEditor();
            });
          }

          if (galleryPieceSearchInput) {
            galleryPieceSearchInput.addEventListener('input', function () {
              syncVisiblePiecesIntoState();
              renderGalleryEditor();
            });
          }

          if (galleryPieceCategoryFilter) {
            galleryPieceCategoryFilter.addEventListener('change', function () {
              syncVisiblePiecesIntoState();
              renderGalleryEditor();
            });
          }

          if (galleryExpandAllButton) {
            galleryExpandAllButton.addEventListener('click', function () {
              Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]')).forEach(function (card) {
                card.setAttribute('open', 'open');
              });
            });
          }

          if (galleryCollapseAllButton) {
            galleryCollapseAllButton.addEventListener('click', function () {
              Array.from(galleryEditorEl.querySelectorAll('[data-piece-card]')).forEach(function (card) {
                card.removeAttribute('open');
              });
            });
          }

          galleryForm.addEventListener('submit', function () {
            syncVisiblePiecesIntoState();
            galleryPiecesJsonField.value = JSON.stringify(galleryPiecesState.filter(isMeaningfulPiece));
          });
        }

        if (journalEditorEl && journalForm && journalPostsJsonField) {
          renderJournalEditor();

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const removeButton = event.target.closest('[data-remove-journal-post]');
            if (!removeButton) return;

            event.preventDefault();
            syncVisibleJournalPostsIntoState();
            const index = Number(removeButton.getAttribute('data-remove-journal-post'));
            journalPostsState = journalPostsState.filter(function (_post, postIndex) {
              return postIndex !== index;
            });
            renderJournalEditor();
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const duplicateButton = event.target.closest('[data-duplicate-journal-post]');
            if (!duplicateButton) {
              return;
            }

            event.preventDefault();
            syncVisibleJournalPostsIntoState();
            const index = Number(duplicateButton.getAttribute('data-duplicate-journal-post'));
            const current = journalPostsState[index];
            if (!current) {
              return;
            }

            const duplicated = normalizeJournalEditorPost({
              ...current,
              id: '',
              slug: current.slug ? current.slug + '-copy' : '',
              title: current.title ? current.title + ' Copy' : '',
              published: false,
              featured: false,
            });
            journalPostsState.splice(index + 1, 0, duplicated);
            renderJournalEditor();
            setStatus('Journal post duplicated as a draft.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const moveButton = event.target.closest('[data-move-journal-post]');
            if (!moveButton) {
              return;
            }

            event.preventDefault();
            syncVisibleJournalPostsIntoState();
            const index = Number(moveButton.getAttribute('data-move-journal-post'));
            const direction = Number(moveButton.getAttribute('data-direction'));
            const nextIndex = index + direction;

            if (index < 0 || nextIndex < 0 || nextIndex >= journalPostsState.length) {
              return;
            }

            const nextState = journalPostsState.slice();
            const currentPost = nextState[index];
            nextState[index] = nextState[nextIndex];
            nextState[nextIndex] = currentPost;
            journalPostsState = nextState;
            renderJournalEditor();
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const coverButton = event.target.closest('[data-set-journal-cover]');
            if (!coverButton) {
              return;
            }

            event.preventDefault();
            const card = coverButton.closest('[data-journal-card]');
            const coverImageUrlField = card && card.querySelector('[data-field="coverImageUrl"]');
            const nextCoverUrl = coverButton.getAttribute('data-set-journal-cover') || '';

            if (!(coverImageUrlField instanceof HTMLInputElement) || !nextCoverUrl) {
              return;
            }

            coverImageUrlField.value = nextCoverUrl;
            syncVisibleJournalPostsIntoState();
            renderJournalEditor();
            setStatus('Cover image updated for this journal post.', false);
          });

          journalEditorEl.addEventListener('click', async function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const uploadButton = event.target.closest('[data-upload-journal-field]');
            if (!uploadButton) {
              return;
            }

            event.preventDefault();
            const uploadTarget = uploadButton.getAttribute('data-upload-journal-field');
            const card = uploadButton.closest('[data-journal-card]');
            const fileInput = card && card.querySelector('[data-journal-upload-file="' + uploadTarget + '"]');
            const coverField = card && card.querySelector('[data-field="coverImageUrl"]');
            const galleryField = card && card.querySelector('[data-field="galleryImageUrls"]');
            const selectedFiles =
              fileInput instanceof HTMLInputElement && fileInput.files
                ? Array.from(fileInput.files)
                : [];

            if (selectedFiles.length === 0) {
              setStatus('Select one or more images first.', true);
              return;
            }

            try {
              setStatus('Uploading image' + (selectedFiles.length > 1 ? 's' : '') + '...', false);
              const uploadedUrls = await uploadMultipleImages(selectedFiles);

              if (uploadTarget === 'cover' && coverField instanceof HTMLInputElement) {
                insertUploadUrlIntoField(coverField, uploadedUrls[0], 'replace');
                if (galleryField instanceof HTMLTextAreaElement) {
                  uploadedUrls.forEach(function (url) {
                    insertUploadUrlIntoField(galleryField, url, 'append');
                  });
                }
              } else if (uploadTarget === 'gallery' && galleryField instanceof HTMLTextAreaElement) {
                uploadedUrls.forEach(function (url) {
                  insertUploadUrlIntoField(galleryField, url, 'append');
                });
              }

              renderJournalEditor();
              refreshUploads();
              setStatus('Uploaded ' + uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' into the journal post.', false);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setStatus(message, true);
            }
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const focusButton = event.target.closest('[data-focus-upload-field]');
            if (!focusButton) {
              return;
            }

            event.preventDefault();
            const card = focusButton.closest('[data-journal-card]');
            const fieldName = focusButton.getAttribute('data-focus-upload-field');
            const field = card && card.querySelector('[data-field="' + fieldName + '"]');
            if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
              return;
            }

            lastFocusedUploadField = field;
            field.focus();
            setStatus('Field selected. Choose an image from the archive below and press Insert.', false);
          });

          journalEditorEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const snippetButton = event.target.closest('[data-insert-body-snippet]');
            if (!snippetButton) {
              return;
            }

            event.preventDefault();
            const snippetType = snippetButton.getAttribute('data-insert-body-snippet');
            const card = snippetButton.closest('[data-journal-card]');
            const bodyField = card && card.querySelector('[data-field="body"]');
            if (!(bodyField instanceof HTMLTextAreaElement)) {
              return;
            }

            const snippets = {
              heading: '## New Section',
              quote: '> Add a memorable line here.',
              list: '- First point\n- Second point',
              break: '',
            };
            const snippet = snippets[snippetType] ?? '';
            const existing = String(bodyField.value || '');
            bodyField.value = existing
              ? existing.replace(/s*$/, '') + '\n\n' + snippet
              : snippet;
            triggerFieldChange(bodyField);
            bodyField.focus();
          });

          journalEditorEl.addEventListener('focusin', function (event) {
            const target = event.target;
            if (
              (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) &&
              typeof target.getAttribute('data-upload-mode') === 'string'
            ) {
              lastFocusedUploadField = target;
            }
          });

          journalEditorEl.addEventListener('change', function (event) {
            const target = event.target;
            if (
              target instanceof HTMLInputElement &&
              target.getAttribute('data-field') === 'title'
            ) {
              const card = target.closest('[data-journal-card]');
              const slugField = card && card.querySelector('[data-field="slug"]');
              const currentSlug = slugField instanceof HTMLInputElement ? slugField.value.trim() : '';
              const titleSlug = slugifyPieceId(target.value || '');

              if (slugField instanceof HTMLInputElement && !currentSlug) {
                slugField.value = titleSlug;
              }
            }

            if (
              target instanceof HTMLTextAreaElement &&
              target.getAttribute('data-field') === 'galleryImageUrls'
            ) {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
              return;
            }

            if (
              target instanceof HTMLInputElement &&
              (target.getAttribute('data-field') === 'coverImageUrl' ||
                target.getAttribute('data-field') === 'featured' ||
                target.getAttribute('data-field') === 'published')
            ) {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
            }
          });

          if (journalAddPostButton) {
            journalAddPostButton.addEventListener('click', function () {
              syncVisibleJournalPostsIntoState();
              journalPostsState.push(normalizeJournalEditorPost({
                id: '',
                slug: '',
                title: '',
                excerpt: '',
                category: '',
                publishedAt: new Date().toISOString().slice(0, 10),
                featured: false,
                published: false,
                coverImageUrl: '',
                coverImageAlt: '',
                galleryImageUrls: [],
                body: '',
              }));
              renderJournalEditor();
            });
          }

          if (journalPostSearchInput) {
            journalPostSearchInput.addEventListener('input', function () {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
            });
          }

          if (journalPostStatusFilter) {
            journalPostStatusFilter.addEventListener('change', function () {
              syncVisibleJournalPostsIntoState();
              renderJournalEditor();
            });
          }

          if (journalExpandAllButton) {
            journalExpandAllButton.addEventListener('click', function () {
              Array.from(journalEditorEl.querySelectorAll('[data-journal-card]')).forEach(function (card) {
                card.setAttribute('open', 'open');
              });
            });
          }

          if (journalCollapseAllButton) {
            journalCollapseAllButton.addEventListener('click', function () {
              Array.from(journalEditorEl.querySelectorAll('[data-journal-card]')).forEach(function (card) {
                card.removeAttribute('open');
              });
            });
          }

          journalForm.addEventListener('submit', function () {
            syncVisibleJournalPostsIntoState();
            journalPostsJsonField.value = JSON.stringify(journalPostsState.filter(isMeaningfulJournalPost));
          });
        }

        if (journalDeviceUploadInput instanceof HTMLInputElement) {
          const handleJournalDeviceUpload = async function (mode) {
            const files = journalDeviceUploadInput.files ? Array.from(journalDeviceUploadInput.files) : [];
            if (files.length === 0) {
              setStatus('Select one or more images from this device first.', true);
              return;
            }

            const activeCard = lastFocusedUploadField ? lastFocusedUploadField.closest('[data-journal-card]') : null;
            const coverField = activeCard && activeCard.querySelector('[data-field="coverImageUrl"]');
            const galleryField = activeCard && activeCard.querySelector('[data-field="galleryImageUrls"]');

            if (mode !== 'selected' && !activeCard) {
              setStatus('Select a journal post field first so the upload knows where to place the image.', true);
              return;
            }

            if (mode === 'selected' && !lastFocusedUploadField) {
              setStatus('Select a journal cover or gallery field first, then upload.', true);
              return;
            }

            try {
              setStatus('Uploading image' + (files.length > 1 ? 's' : '') + '...', false);
              const uploadedUrls = await uploadMultipleImages(files);

              if (mode === 'cover') {
                if (!(coverField instanceof HTMLInputElement)) {
                  setStatus('Could not find the journal cover field.', true);
                  return;
                }

                insertUploadUrlIntoField(coverField, uploadedUrls[0], 'replace');
                if (galleryField instanceof HTMLTextAreaElement) {
                  uploadedUrls.forEach(function (url) {
                    insertUploadUrlIntoField(galleryField, url, 'append');
                  });
                }
              } else if (mode === 'gallery') {
                if (!(galleryField instanceof HTMLTextAreaElement)) {
                  setStatus('Could not find the journal gallery field.', true);
                  return;
                }

                uploadedUrls.forEach(function (url) {
                  insertUploadUrlIntoField(galleryField, url, 'append');
                });
              } else {
                uploadedUrls.forEach(function (url) {
                  insertUploadUrlIntoField(lastFocusedUploadField, url);
                });
              }

              journalDeviceUploadInput.value = '';
              renderJournalEditor();
              refreshUploads();
              setStatus('Uploaded ' + uploadedUrls.length + ' image' + (uploadedUrls.length === 1 ? '' : 's') + ' from this device.', false);
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Upload failed.';
              setStatus(message, true);
            }
          };

          if (journalUploadToSelectedButton) {
            journalUploadToSelectedButton.addEventListener('click', function () {
              handleJournalDeviceUpload('selected');
            });
          }

          if (journalUploadToCoverButton) {
            journalUploadToCoverButton.addEventListener('click', function () {
              handleJournalDeviceUpload('cover');
            });
          }

          if (journalUploadToGalleryButton) {
            journalUploadToGalleryButton.addEventListener('click', function () {
              handleJournalDeviceUpload('gallery');
            });
          }
        }

        if (uploadsSearchInput) {
          uploadsSearchInput.addEventListener('input', renderUploads);
        }

        if (uploadsPathbarEl) {
          uploadsPathbarEl.addEventListener('click', function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const breadcrumbButton = event.target.closest('[data-open-folder]');
            if (!breadcrumbButton) {
              return;
            }

            event.preventDefault();
            refreshUploads(breadcrumbButton.getAttribute('data-open-folder') || '');
          });
        }

        if (uploadsListEl) {
          uploadsListEl.addEventListener('click', async function (event) {
            if (!(event.target instanceof Element)) {
              return;
            }

            const copyButton = event.target.closest('[data-copy-upload]');
            const insertButton = event.target.closest('[data-insert-upload]');

            if (copyButton) {
              const url = copyButton.getAttribute('data-copy-upload') || '';

              try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(url);
                  setStatus('Image URL copied to clipboard.', false);
                } else {
                  setStatus('Clipboard copy is unavailable in this browser context.', true);
                }
              } catch {
                setStatus('Could not copy that URL automatically.', true);
              }

              return;
            }

            if (insertButton) {
              const url = insertButton.getAttribute('data-insert-upload') || '';

              if (!lastFocusedUploadField || !document.contains(lastFocusedUploadField)) {
                setStatus('Select an image field first, then use Insert.', true);
                return;
              }

              const uploadMode = lastFocusedUploadField.getAttribute('data-upload-mode') || 'append';
              const currentValue = String(lastFocusedUploadField.value || '').trim();
              lastFocusedUploadField.value = uploadMode === 'replace'
                ? url
                : currentValue ? currentValue + '\n' + url : url;
              lastFocusedUploadField.dispatchEvent(new Event('change', { bubbles: true }));
              lastFocusedUploadField.focus();
              setStatus('Image URL inserted into the selected field.', false);
            }
          });
        }

        refreshUploads();
      })();