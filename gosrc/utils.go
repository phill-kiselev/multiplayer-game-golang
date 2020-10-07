package gosrc

import "log"

type PlaneData struct {
	Pcoords [4][3]float64
	Pcoefs  [4]float64
}

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
func intersects(x1, x2, x3, x4 [3]float64) bool {
	a, b, c, d, p, q, r, s := x1[0], x1[2], x2[0], x2[2], x3[0], x3[2], x4[0], x4[2]
	det := (c-a)*(s-q) - (r-p)*(d-b)
	if det == 0 {
		return false
	} else {
		lambda := ((s-q)*(r-a) + (p-r)*(s-b)) / det
		gamma := ((b-d)*(r-a) + (c-a)*(s-b)) / det
		return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
	}
}
func qweqwe(xyzs [4][3]float64) bool {
	fgg := false
	for i := 0; i <= len(xyzs)-2; i++ {
		for j := i + 1; j <= len(xyzs)-1; j++ {
			if j != len(xyzs)-1 {
				fgg = intersects(xyzs[i], xyzs[i+1], xyzs[j], xyzs[j+1])
			} else {
				fgg = intersects(xyzs[i], xyzs[i+1], xyzs[j], xyzs[0])
			}
			if fgg {
				return false
			}
		}
	}
	return true
}
func CountPlane(PD *PData) {
	var XS [12]float64 = PD.Pcoords
	var XYZs [4][3]float64
	var XYZs1 [4][3]float64
	jj1 := [4]int{0, 1, 2, 3}
	for i, num := range jj1 {
		XYZs1[i] = [3]float64{XS[num*3], XS[num*3+1], XS[num*3+2]}
	}
	var XYZs2 [4][3]float64
	jj2 := [4]int{0, 2, 1, 3}
	for i, num := range jj2 {
		XYZs2[i] = [3]float64{XS[num*3], XS[num*3+1], XS[num*3+2]}
	}
	var XYZs3 [4][3]float64
	jj3 := [4]int{0, 1, 3, 2}
	for i, num := range jj3 {
		XYZs3[i] = [3]float64{XS[num*3], XS[num*3+1], XS[num*3+2]}
	}

	tmp := qweqwe(XYZs1)
	if !tmp {
		tmp = qweqwe(XYZs2)
		if !tmp {
			tmp = qweqwe(XYZs3)
			if !tmp {
				log.Println("ERROR", XYZs1)
			} else {
				XYZs = XYZs3
			}
		} else {
			XYZs = XYZs2
		}
	} else {
		XYZs = XYZs1
	}

	if PD.Ptype == "incPLANE" {
		l1 := LINEStruct{Y: XYZs[0][1], p1: Coord2D{XYZs[0][0], XYZs[0][2]}, p2: Coord2D{XYZs[1][0], XYZs[1][2]}}
		l1.CountCoefs()
		l2 := LINEStruct{Y: XYZs[2][1], p1: Coord2D{XYZs[2][0], XYZs[2][2]}, p2: Coord2D{XYZs[3][0], XYZs[3][2]}}
		l2.CountCoefs()
		iP := IncPLANEStruct{L1: l1, L2: l2}
		iP.CountCoefs()
		iP.Conid = PD.Conid
		iP.Cons = PD.Cons
		IncPLANES[iP.Conid] = &iP
		//PLANES[iP.Conid] = PLANEStruct{i: &iP}
		//PLANES[iP.Conid][string(iP.Conid[0])] = &iP
		//log.Println(iP)
		// Mo := XYZs[3]
		// V := [3]float64{XYZs[1][0] - XYZs[0][0], XYZs[1][1] - XYZs[0][1], XYZs[1][2] - XYZs[0][2]}
		// W := [3]float64{XYZs[2][0] - XYZs[1][0], XYZs[2][1] - XYZs[1][1], XYZs[2][2] - XYZs[1][2]}
		// det1 := V[1]*W[2] - V[2]*W[1]
		// det2 := V[0]*W[2] - V[2]*W[0]
		// det3 := V[0]*W[1] - V[1]*W[0]
		// coefs := [4]float64{det1, -det2, det3, -det1*Mo[0] + det2*Mo[1] - det3*Mo[2]}
	} else if PD.Ptype == "colPLANE" {
		l1 := LINEStruct{Y: XYZs[0][1], p1: Coord2D{XYZs[0][0], XYZs[0][2]}, p2: Coord2D{XYZs[1][0], XYZs[1][2]}}
		l1.CountCoefs()
		l2 := LINEStruct{Y: XYZs[2][1], p1: Coord2D{XYZs[2][0], XYZs[2][2]}, p2: Coord2D{XYZs[3][0], XYZs[3][2]}}
		l2.CountCoefs()
		l3 := LINEStruct{Y: XYZs[1][1], p1: Coord2D{XYZs[1][0], XYZs[0][2]}, p2: Coord2D{XYZs[2][0], XYZs[2][2]}}
		l3.CountCoefs()
		l4 := LINEStruct{Y: XYZs[3][1], p1: Coord2D{XYZs[3][0], XYZs[3][2]}, p2: Coord2D{XYZs[0][0], XYZs[0][2]}}
		l4.CountCoefs()
		cP := ColPLANEStruct{L1: l1, L2: l2, L3: l3, L4: l4}
		cP.Conid = PD.Conid
		cP.Cons = PD.Cons
		ColPLANES[cP.Conid] = &cP
		//LANES[cP.Conid] = PLANEStruct{c: &cP}
		//PLANES[cP.Conid][string(cP.Conid[0])] = &cP
		//log.Println(cP)
	} else if PD.Ptype == "GeneratePLANE" {
		gP := UsuPLANEStruct{Y: XYZs[0][1], P1: Coord2D{XYZs[0][0], XYZs[0][2]}, P2: Coord2D{XYZs[1][0], XYZs[1][2]}, P3: Coord2D{XYZs[2][0], XYZs[2][2]}, P4: Coord2D{XYZs[3][0], XYZs[3][2]}}
		gP.Conid = PD.Conid
		gP.Cons = PD.Cons
		gP.is_gen = true
		GenIDs = append(GenIDs, gP.Conid)
		UsuPLANES[gP.Conid] = &gP
		//PLANES[gP.Conid] = PLANEStruct{G: &gP}
		//PLANES[gP.Conid][string(gP.Conid[0])] = &gP
		//log.Println(GenIDs)
	} else if PD.Ptype == "PLANE" {
		uP := UsuPLANEStruct{Y: XYZs[0][1], P1: Coord2D{XYZs[0][0], XYZs[0][2]}, P2: Coord2D{XYZs[1][0], XYZs[1][2]}, P3: Coord2D{XYZs[2][0], XYZs[2][2]}, P4: Coord2D{XYZs[3][0], XYZs[3][2]}}
		uP.Conid = PD.Conid
		uP.Cons = PD.Cons
		uP.is_gen = false
		UsuPLANES[uP.Conid] = &uP
		//PLANES[uP.Conid] = PLANEStruct{u: &uP}
		//PLANES[uP.Conid][string(uP.Conid[0])] = &uP
		//log.Println(uP)
	}

	//outobj := PlaneData{XYZs, coefs} //  [4][3]float64, [3]float64
	//outobj.pcoords = XYZs;
	//outobj.pcoefs = coefs;
	//return outobj
}
