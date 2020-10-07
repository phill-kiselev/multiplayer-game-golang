package gosrc

import "math"

var ColPLANES map[string]*ColPLANEStruct
var IncPLANES map[string]*IncPLANEStruct
var UsuPLANES map[string]*UsuPLANEStruct

//var PLANES map[string]map[string]interface{} //PLANEStruct
var GenIDs []string

func InitWorld() {
	IncPLANES = make(map[string]*IncPLANEStruct, 2)
	ColPLANES = make(map[string]*ColPLANEStruct, 4)
	UsuPLANES = make(map[string]*UsuPLANEStruct, 4)
	//PLANES = make(map[string]map[string]interface{})
	GenIDs = make([]string, 0)
}

//var PLANES []PLANEStruct

// type PLANEStruct struct {
// 	colP *ColPLANEStruct
// 	incP *IncPLANEStruct
// 	usuP *UsuPLANEStruct
// }
// type PLANEStruct struct {
// 	c *ColPLANEStruct
// 	i *IncPLANEStruct
// 	u *UsuPLANEStruct
// 	G *UsuPLANEStruct
// }

type IncPLANEStruct struct {
	L1    LINEStruct
	L2    LINEStruct
	Coefs Coefs4D
	Conid string
	Cons  []string
	// ColCons []*ColPLANEStruct
	// GenCons []*genPLANEStruct
	// Cons    []*PLANEStruct
	//IncCons *IncPLANEStruct
}

func (iP *IncPLANEStruct) CountCoefs() {
	Mo := [3]float64{iP.L2.p2.X, iP.L2.Y, iP.L2.p2.Z}
	V := [3]float64{iP.L1.p2.X - iP.L1.p1.X, iP.L1.Y - iP.L1.Y, iP.L1.p2.Z - iP.L1.p1.Z}
	W := [3]float64{iP.L2.p1.X - iP.L1.p2.X, iP.L2.Y - iP.L1.Y, iP.L2.p1.Z - iP.L1.p2.Z}
	det1 := V[1]*W[2] - V[2]*W[1]
	det2 := V[0]*W[2] - V[2]*W[0]
	det3 := V[0]*W[1] - V[1]*W[0]
	iP.Coefs = Coefs4D{det1, -det2, det3, -det1*Mo[0] + det2*Mo[1] - det3*Mo[2]}
}

type ColPLANEStruct struct {
	L1    LINEStruct
	L2    LINEStruct
	L3    LINEStruct
	L4    LINEStruct
	Conid string
	Cons  []string
	//ColCons *ColPLANEStruct
	// GenCons []*genPLANEStruct
	// Cons    []*PLANEStruct
	// IncCons []*IncPLANEStruct
}

type UsuPLANEStruct struct {
	Y      float64
	P1     Coord2D
	P2     Coord2D
	P3     Coord2D
	P4     Coord2D
	Conid  string
	Cons   []string
	is_gen bool
	// ColCons []*ColPLANEStruct
	// GenCons []*genPLANEStruct
	// Cons    []*PLANEStruct
	// IncCons []*IncPLANEStruct
}

type LINEStruct struct {
	Y     float64
	p1    Coord2D
	p2    Coord2D
	Coefs Coefs2D
}

func (L *LINEStruct) CountCoefs() {

	if L.p2.X != L.p1.X {
		K := (L.p2.Z - L.p1.Z) / (L.p2.X - L.p1.X)
		B := L.p1.Z - K*L.p1.X
		L.Coefs = Coefs2D{K: K, B: B}
	} else {
		L.Coefs = Coefs2D{xx: L.p1.X}
	}
}
func (L *LINEStruct) Avg() Coord2D {
	return Coord2D{(L.p1.X + L.p2.X) / 2, (L.p1.Z + L.p2.Z) / 2}
}

type Coord2D struct {
	X float64
	Z float64
}

func (p1 Coord2D) Distance(p2 Coord2D) float64 {
	return math.Sqrt(math.Pow(p1.X-p2.X, 2) + math.Pow(p1.Z-p2.Z, 2))
}

type Coefs2D struct {
	K  float64
	B  float64
	xx float64
}
type Coefs4D struct {
	x1 float64
	x2 float64
	x3 float64
	x4 float64
}
type PData struct {
	Ptype   string
	Pcoords [12]float64
	Conid   string
	Cons    []string
}

func WRITE_PLANE_TO_DATABASE(pl *PData) {
	//log.Println(pl)
	CountPlane(pl)
	//log.Println(IncPLANES)
	//log.Println(ColPLANES)
}
