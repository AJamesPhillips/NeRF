// Generated by CoffeeScript 2.0.0
(function() {
  /* ABOUT
               .__
  _________  __|  |
  \____ \  \/  /  |
  |  |_> >    <|  |__
  |   __/__/\_ \____/
  |__|        \/     js
                      PXL.js
                      Benjamin Blundell - ben@pxljs.com
                      http://pxljs.com
  This software is released under the MIT Licence. See LICENCE.txt for details

  A short program to visualize CDR-H3 Loops

   */
  var Chains, Residue, TestChain, cgl, chains, computed_ca, d0, d1, d2, final_ca, l0, l1, l2, params, real_ca;

  // Actual carbon alpha positions of 3C6S_2
  real_ca = [];

  real_ca.push(new PXL.Math.Vec3(31.89, 53.538, -2.462));

  real_ca.push(new PXL.Math.Vec3(29.323, 54.052, -0.956));

  real_ca.push(new PXL.Math.Vec3(27.71, 57.258, -2.27));

  real_ca.push(new PXL.Math.Vec3(27.985, 57.642, -6.042));

  // mod these numbers to match the reference frame
  d0 = PXL.Math.Vec3.sub(real_ca[1], real_ca[0]);

  d1 = PXL.Math.Vec3.sub(real_ca[2], real_ca[1]);

  d2 = PXL.Math.Vec3.sub(real_ca[3], real_ca[2]);

  l0 = d0.length();

  l1 = d1.length();

  l2 = d2.length();

  d0.normalize();

  d1.normalize();

  d2.normalize();

  // Starting from zero, here are the real values
  final_ca = [];

  final_ca.push(new PXL.Math.Vec3(0, 0, 0));

  final_ca.push(PXL.Math.Vec3.add(final_ca[0], d0.multScalar(l0)));

  final_ca.push(PXL.Math.Vec3.add(final_ca[1], d1.multScalar(l1)));

  final_ca.push(PXL.Math.Vec3.add(final_ca[2], d2.multScalar(l2)));

  // Place holder for computed
  computed_ca = [];

  TestChain = class TestChain {
    _bond_rot(sp, ep) {
      var dd, dp, m, xp, y;
      dp = PXL.Math.Vec3.sub(ep, sp).normalize();
      y = new PXL.Math.Vec3(0, 1, 0);
      xp = PXL.Math.Vec3.cross(y, dp);
      dd = Math.acos(dp.dot(y));
      m = new PXL.Math.Matrix4();
      return m.rotate(xp, dd);
    }

    constructor(ca_pos) {
      var a, atom_geom, atom_mat, atom_node, bond_geom, bond_mat, bond_node, idx, k, len, mm, mp, pg, residue_atoms_node, residue_bonds_node;
      bond_geom = new PXL.Geometry.Cylinder(0.13, 50, 1, 3.82);
      atom_geom = new PXL.Geometry.Sphere(0.5, 10);
      pg = new PXL.Colour.RGBA(0.8, 0.8, 0.8, 1.0);
      bond_mat = new PXL.Material.BasicColourMaterial(pg);
      atom_mat = new PXL.Material.BasicColourMaterial(pg);
      this.top_node = new PXL.Node();
      residue_atoms_node = new PXL.Node();
      residue_bonds_node = new PXL.Node();
      residue_atoms_node.add(atom_mat);
      residue_bonds_node.add(bond_mat);
      this.top_node.add(residue_atoms_node);
      this.top_node.add(residue_bonds_node);
      idx = 0;
      for (k = 0, len = ca_pos.length; k < len; k++) {
        a = ca_pos[k];
        atom_node = new PXL.Node(atom_geom);
        residue_atoms_node.add(atom_node);
        atom_node.matrix.translate(a);
        if (idx !== 0) {
          bond_node = new PXL.Node(bond_geom);
          residue_bonds_node.add(bond_node);
          mp = PXL.Math.Vec3.add(a, ca_pos[idx - 1]).multScalar(0.5);
          mm = this._bond_rot(a, ca_pos[idx - 1]);
          bond_node.matrix.translate(mp).mult(mm);
        }
        idx += 1;
      }
    }

  };

  Residue = class Residue {
    constructor(phi, psi, omega, bond_geom, atom_geom, bond_mat, atom_mat, show_bond) {
      var residue_atoms_node, residue_bonds_node;
      // Assuming fixed bond lengths and angles with C as the central point
      // Start left handed - initial positions
      this.a = new PXL.Math.Vec3(-2.098, 1.23, 0);
      this.b = new PXL.Math.Vec3(-1.33, 0, 0);
      this.c = new PXL.Math.Vec3(0, 0, 0);
      this.phi = phi;
      this.psi = psi;
      this.omega = omega;
      this.c_alpha = this.a;
      this.nitrogen = this.b;
      this.carbon = this.c;
      this.residue_node = new PXL.Node();
      residue_atoms_node = new PXL.Node();
      residue_bonds_node = new PXL.Node();
      residue_atoms_node.add(atom_mat);
      residue_bonds_node.add(bond_mat);
      this.atom_node_a = new PXL.Node(atom_geom);
      this.atom_node_b = new PXL.Node(atom_geom);
      this.atom_node_c = new PXL.Node(atom_geom);
      this.bond_node_a = new PXL.Node(bond_geom);
      residue_atoms_node.add(this.atom_node_a);
      //residue_atoms_node.add @atom_node_b
      //residue_atoms_node.add @atom_node_c
      if (show_bond) {
        residue_bonds_node.add(this.bond_node_a);
      }
      this.set_positions();
      // ignore bonds for now
      this.residue_node.add(residue_atoms_node);
      this.residue_node.add(residue_bonds_node);
      this.res_node = new PXL.Node();
    }

    clear_positions() {
      this.atom_node_a.matrix.identity();
      this.atom_node_b.matrix.identity();
      return this.atom_node_b.matrix.identity();
    }

    set_positions() {
      this.clear_positions();
      this.atom_node_a.matrix.translate(this.a);
      this.atom_node_b.matrix.translate(this.b);
      return this.atom_node_c.matrix.translate(this.c);
    }

    // Implementation of the NeRF algorithm
    // THIS IS THE KEY part of the program
    // Essentially, the first 3 atoms/first residue is placed
    // we then run next_pos which is placed, based on the previous
    next_pos(prev_res, flip) {
      var R, a, ab, abn, b, bangles, bc, bcn, blengths, c, d, i, k, m, n, na, nbc, torsions;
      a = prev_res.a.clone();
      b = prev_res.b.clone();
      c = prev_res.c.clone();
      d = this.a;
      na = [this.b, this.c];
      blengths = [1.53, 1.453, 1.325];
      bangles = [PXL.Math.degToRad(115), PXL.Math.degToRad(109), PXL.Math.degToRad(121)];
      torsions = [prev_res.omega, prev_res.psi, this.phi];
      for (i = k = 0; k <= 2; i = ++k) {
        ab = PXL.Math.Vec3.sub(b, a);
        abn = PXL.Math.Vec3.normalize(ab);
        bc = PXL.Math.Vec3.sub(c, b);
        bcn = PXL.Math.Vec3.multScalar(bc, 1.0 / blengths[i]);
        R = blengths[i];
        d.x = R * Math.cos(bangles[i]);
        d.y = R * Math.cos(torsions[i]) * Math.sin(bangles[i]);
        d.z = R * Math.sin(torsions[i]) * Math.sin(bangles[i]);
        n = PXL.Math.Vec3.cross(ab, bcn).normalize();
        nbc = PXL.Math.Vec3.cross(n, bcn);
        //m = new PXL.Math.Matrix3([bcn.x, nbc.x, n.x, bcn.y, nbc.y, n.y, bcn.z, nbc.z, n.z])
        m = new PXL.Math.Matrix3([bcn.x, bcn.y, bcn.z, nbc.x, nbc.y, nbc.z, n.x, n.y, n.z]);
        d.x = -d.x;
        m.multVec(d);
        d.add(c);
        // Shift along one
        if (i !== 2) {
          a = b;
          b = c;
          c = d;
          d = na[i];
        } else {
          // On the first atom which is a Ca
          computed_ca.push(d);
        }
      }
      return this.set_positions();
    }

  };

  // Main class for dealing with our 3D chains
  Chains = class Chains {
    _bond_rot(sp, ep) {
      var dd, dp, m, xp, y;
      dp = PXL.Math.Vec3.sub(ep, sp).normalize();
      y = new PXL.Math.Vec3(0, 1, 0);
      xp = PXL.Math.Vec3.cross(y, dp);
      dd = Math.acos(dp.dot(y));
      m = new PXL.Math.Matrix4();
      return m.rotate(xp, dd);
    }

    _create_chain(idx) {
      var atom_geom, bond_geom, flip, i, k, mm, model_node, mp, num_residues, omega, phi, prev_res, psi, ref, residue, rn, show_bond;
      this.residues = [];
      bond_geom = new PXL.Geometry.Cylinder(0.13, 50, 1, 3.82);
      atom_geom = new PXL.Geometry.Sphere(0.5, 10);
      model_node = new PXL.Node();
      num_residues = this.data[idx]['residues'].length;
      flip = 1.0;
      prev_res = null;
      show_bond = false;
      for (i = k = 0, ref = num_residues - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        //for i in [0..2]
        phi = this.data[idx]['angles'][i]['phi'];
        psi = this.data[idx]['angles'][i]['psi'];
        omega = this.data[idx]['angles'][i]['omega'];
        phi = PXL.Math.degToRad(phi);
        psi = PXL.Math.degToRad(psi);
        omega = PXL.Math.degToRad(omega);
        residue = new Residue(phi, psi, omega, bond_geom, atom_geom, this._get_material_bond(i, num_residues), this._get_material_atom(i, num_residues), show_bond);
        if (i > 0) {
          residue.next_pos(prev_res, flip);
          // Now work on the bonds
          mp = PXL.Math.Vec3.add(residue.a, prev_res.a).multScalar(0.5);
          mm = this._bond_rot(residue.a, prev_res.a);
          residue.bond_node_a.matrix.translate(mp).mult(mm);
        }
        rn = residue.residue_node;
        model_node.add(rn);
        this.residues.push(residue);
        flip *= -1.0;
        show_bond = true;
        prev_res = residue;
      }
      return model_node;
    }

    _get_material_atom(i, num_residues) {
      var calpha_material, pg, pink;
      pink = new PXL.Colour.RGBA(0.8, 0.4, 0.4, 1.0);
      pg = pink.clone();
      pg.r = pg.r / num_residues * (i + 1);
      pg.g = pg.g / num_residues * (i + 1);
      pg.b = pg.b / num_residues * (i + 1);
      return calpha_material = new PXL.Material.BasicColourMaterial(pg);
    }

    _get_material_bond(i, num_residues) {
      var backbone_material, green, tg;
      green = new PXL.Colour.RGBA(0.1, 0.8, 0.1, 1.0);
      tg = green.clone();
      tg.r = tg.r / num_residues * (i + 1);
      tg.g = tg.g / num_residues * (i + 1);
      tg.b = tg.b / num_residues * (i + 1);
      return backbone_material = new PXL.Material.BasicColourMaterial(tg);
    }

    _parse_cdr(data) {
      // Now parse our CDR
      data = eval('(' + data + ')');
      this.data = data.data;
      return this._setup_3d();
    }

    _error() {
      // Damn! Error occured
      return alert("Error downloading CDR-H3 File");
    }

    _setup_3d() {
      var a, j, k, l, len, len1, model_node, num_models, o, ref, ref1, results, tc, tidx, uber;
      // Create the top node and add our camera
      this.top_node = new PXL.Node();
      this.c = new PXL.Camera.MousePerspCamera(new PXL.Math.Vec3(0, 0, 25));
      this.top_node.add(this.c);
      num_models = this.data.length;
      console.log("num models:" + num_models);
      tidx = 0;
      // For now just pick the one model
      //while @data[tidx]['name'] != "1NC2_1"
      while (this.data[tidx]['name'] !== "3C6S_2") {
        tidx += 1;
      }
      for (j = k = ref = tidx, ref1 = tidx; ref <= ref1 ? k <= ref1 : k >= ref1; j = ref <= ref1 ? ++k : --k) {
        model_node = this._create_chain(j);
        this.top_node.add(model_node);
      }
      // Add the test chain
      tc = new TestChain(final_ca);
      this.top_node.add(tc.top_node);
      uber = new PXL.GL.UberShader(this.top_node);
      this.top_node.add(uber);
      // Print our test values
      console.log("Real CA positions");
      for (l = 0, len = final_ca.length; l < len; l++) {
        a = final_ca[l];
        console.log(a);
      }
      console.log("Computed CA Positions");
      results = [];
      for (o = 0, len1 = computed_ca.length; o < len1; o++) {
        a = computed_ca[o];
        results.push(console.log(a));
      }
      return results;
    }

    init() {
      var r;
      r = new PXL.Util.Request("data_angles.json");
      r.get(((data) => {
        return this._parse_cdr(data);
      }), this._error);
      // Basic GL Functions
      GL.enable(GL.CULL_FACE);
      GL.cullFace(GL.BACK);
      return GL.enable(GL.DEPTH_TEST);
    }

    draw() {
      // Clear and draw our shapes
      GL.clearColor(0.95, 0.95, 0.95, 1.0);
      GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
      if (this.top_node != null) {
        return this.top_node.draw();
      }
    }

  };

  chains = new Chains();

  params = {
    canvas: 'webgl-canvas',
    context: chains,
    init: chains.init,
    draw: chains.draw,
    debug: true
  };

  cgl = new PXL.App(params);

}).call(this);
