package main

import (
	"container/list"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"./gosrc"

	"golang.org/x/net/websocket"
)

func main() {

	gosrc.InitWorld()

	log.SetFlags(log.Lshortfile)

	// websocket server
	server := NewServer("/socket")
	go server.Listen()

	fmt.Println("Listening port :8000")

	http.Handle("/lib/", http.StripPrefix("/lib/", http.FileServer(http.Dir("./templates/lib/"))))
	http.Handle("/scripts/", http.StripPrefix("/scripts/", http.FileServer(http.Dir("./templates/scripts/"))))
	http.Handle("/models/", http.StripPrefix("/models/", http.FileServer(http.Dir("./templates/models/"))))
	http.Handle("/", http.FileServer(http.Dir("templates")))
	http.ListenAndServe(":8000", nil)

}

// type Player struct {
// 	id int
// 	x  int
// }

// Chat server.
type Server struct {
	pattern string
	//messages  []*Message
	clients   map[int]*Client
	addCh     chan *Client
	addInRoom chan *Client
	//delCh     chan *Client
	//sendAllCh chan *Message
	//doneCh    chan bool
	ch        chan InChan
	Tick16ms  <-chan time.Time
	Tick500ms <-chan time.Time
}

// Create new chat server.
func NewServer(pattern string) *Server {
	//messages := []*Message{}
	clients := make(map[int]*Client)
	addCh := make(chan *Client)
	addInRoom := make(chan *Client)
	//delCh := make(chan *Client)
	//sendAllCh := make(chan *Message)
	//doneCh := make(chan bool)
	ch := make(chan InChan)
	Tick16ms := time.Tick(time.Duration(16) * time.Millisecond)
	Tick500ms := time.Tick(time.Duration(1000) * time.Millisecond)
	return &Server{
		pattern,
		//messages,
		clients,
		addCh,
		addInRoom,
		//sendAllCh,
		//doneCh,
		ch,
		Tick16ms,
		Tick500ms,
	}
}

func (s *Server) Add(c *Client) {
	s.addCh <- c
}

// func (s *Server) Del(c *Client) {
// 	s.delCh <- c
// }
//
// func (s *Server) SendAll(msg *Message) {
// 	s.sendAllCh <- msg
// }
//
// func (s *Server) Done() {
// 	s.doneCh <- true
// }
//
// func (s *Server) Err(err error) {
// 	s.errCh <- err
// }
//
// func (s *Server) sendPastMessages(c *Client) {
// 	for _, msg := range s.messages {
// 		c.Write(msg)
// 	}
// }
//
// func (s *Server) sendAll(msg *Message) {
// 	for _, c := range s.clients {
// 		c.Write(msg)
// 	}
// }

// Listen and serve.
// It serves client connection and broadcast request.
func (s *Server) Listen() {

	log.Println("Listening server...")

	// Controller
	var room Room
	room.id = 1123
	go Rooming(s, &room)

	// websocket handler
	onConnected := func(ws *websocket.Conn) {
		// defer func() {
		// 	ws.Close()
		// if err != nil {
		// 	s.errCh <- err
		// }
		// }()
		defer ws.Close()

		client := NewClient(ws, s, &room)
		s.Add(client)
		go client.ListenAndCountPlayer()
		client.SendNewState()
	}
	http.Handle(s.pattern, websocket.Handler(onConnected))
	log.Println("Created handler")
	log.Println("Room is ready...")

	for {
		select {

		// Add new a client
		case c := <-s.addCh:
			log.Println("Added new client")
			s.clients[c.id] = c
			log.Println("Now", len(s.clients), "clients connected.")
			//s.addInRoom <- c
			// // del a client
			// case c := <-s.delCh:
			// 	log.Println("Delete client")
			// 	delete(s.clients, c.id)
			//
		}
	}
}

var maxId int = 0

// Chat client.
type Client struct {
	id           int
	ws           *websocket.Conn
	server       *Server
	room         *Room
	outCH        chan string
	x            float64
	z            float64
	quitCH       chan bool
	disconnectCH chan bool
	IS_GO        bool
	IS_ATTACK    bool
	xxx          float64
	zzz          float64
	rotY         float64
	DIR          Coord
	planeNow     string
	bufgo1       list.List
	bufgo2       list.List
	colplanebuf  map[*gosrc.ColPLANEStruct]float64
	incplanebuf  map[*gosrc.IncPLANEStruct]float64
}

const incr float64 = 4.5 * 2 // 2 seconds, each 500ms check out incs

func (p *Client) CheckIncs() {
	plane := gosrc.UsuPLANES[p.planeNow]
	for _, cID := range plane.Cons {
		if pl, ok := gosrc.IncPLANES[cID]; ok {
			//CheckDistance(plane, pl)
			var yL gosrc.LINEStruct
			if plane.Y == pl.L1.Y {
				yL = pl.L1
			} else {
				yL = pl.L2
			}
			avg := yL.Avg()
			myP := gosrc.Coord2D{X: p.x, Z: p.z}
			d := myP.Distance(avg)
			if d > incr {
				delete(p.incplanebuf, pl)
			} else {
				p.incplanebuf[pl] = d
			}
		}
	}
}

func (p *Client) CountRoad(flagbuf chan *list.List, Vx, Vz float64, capacity int) {
	for f := range flagbuf {
		xx := p.x
		zz := p.z
		for j := 0; j < capacity; j++ {
			xx += Vx * 16
			zz += Vz * 16
			f.PushBack(Coord{xx, zz})
		}
		// if f == &p.bufgo1 {
		// 	log.Println("buf1 end")
		// } else {
		// 	log.Println("buf2 end")
		// }
	}
}

// func (p *Client) AddPlanesToBuf() {
// 	if string(p.planeNow[0]) == "i" {
// 		//tmp := gosrc.UsuPLANES[p.planeNow]
// 	} else {
// 		plane := gosrc.UsuPLANES[p.planeNow]
// 		for _, cID := range plane.Cons {
// 			if pl, ok := gosrc.ColPLANES[cID]; ok {
// 				CheckDistance(plane, pl)
// 			}
// 		}
// 	}
// 	// gosrc.PLANES[p.planeNow]
// }
// func (p *Client) RemovePlanesFromBuf() {
//
// }

// Create new chat client.
func NewClient(ws *websocket.Conn, server *Server, room *Room) *Client {

	if ws == nil {
		panic("ws cannot be nil")
	}

	if server == nil {
		panic("server cannot be nil")
	}

	maxId++
	//ch := make(chan *Message, channelBufSize)
	outCH := make(chan string)
	quitCH := make(chan bool)
	disconnectCH := make(chan bool)

	websocket.Message.Send(ws, "$READY")

	//bg1 := list.New()
	//bg2 := list.New()
	var bg1 list.List
	var bg2 list.List

	return &Client{
		id:           maxId,
		ws:           ws,
		server:       server,
		room:         room,
		outCH:        outCH,
		x:            0,
		z:            0,
		quitCH:       quitCH,
		disconnectCH: disconnectCH,
		IS_GO:        false,
		IS_ATTACK:    false,
		xxx:          0,
		zzz:          0,
		rotY:         math.Pi,
		DIR:          Coord{0, 1},
		planeNow:     "",
		bufgo1:       bg1,
		bufgo2:       bg2,
		colplanebuf:  make(map[*gosrc.ColPLANEStruct]float64),
		incplanebuf:  make(map[*gosrc.IncPLANEStruct]float64),
	}
	//{maxId, ws, server, room, outCH, 0, 0, quitCH, disconnectCH,
	//false, false, 0, 0, math.Pi, Coord{0, 1}, "",
	//make([]gosrc.ColPLANES, 0), make([]gosrc.IncPLANES, 0)} //, doneCh}
}

type Room struct {
	ps []*Client
	id int
}

type InChan struct {
	p *Client
	x float64
	y float64
}

const V float64 = 0.0045 // 0.0045 за 1 мс
const EPS float64 = 0.01

type Coord struct {
	x float64
	z float64
}

func (c *Coord) Length() float64 {
	return math.Sqrt(math.Pow(c.x, 2) + math.Pow(c.z, 2))
}

func count_angle_rotate(r1 Coord, r2 Coord) float64 { // r1 = (0,1) r2 =
	cosA := (r1.x*r2.x + r1.z*r2.z) / (r1.Length() * r2.Length())
	//log.Println("cosA: ", cosA)
	r1_new := Coord{r1.x*math.Cos(0.01) - r1.z*math.Sin(0.01), r1.x*math.Sin(0.01) + r1.z*math.Cos(0.01)}
	//log.Println(r1_new)
	cosA1 := (r1_new.x*r2.x + r1_new.z*r2.z) / (r1_new.Length() * r2.Length())
	//log.Println(math.Acos(cosA), math.Acos(cosA1))
	if math.Acos(cosA1) <= math.Acos(cosA) {
		return -math.Acos(cosA)
	} else {
		return math.Acos(cosA)
	}
}

type socketData struct {
	Com     string      `json:"command"`
	XXXZZZ  [2]float64  `json:"xxxzzz"`
	Ptype   string      `json:"ptype"`
	Pcoords [12]float64 `json:"pcoords"`
	Conid   string      `json:"conid"`
	Conlist []string    `json:"conlist"`
	//Plane  gosrc.PData `json:"planedata"`
	//PlaneCoefs  [4]float64    `json:"pcoefs"`
}

// type PData struct {
// 	ptype   string
// 	pcoords [4][3]float64
// }

func (p *Client) ListenAndCountPlayer() {
	for {
		// get (x,y) from client
		msg := &socketData{}
		err := websocket.JSON.Receive(p.ws, &msg)
		if err == io.EOF {
			log.Println(p.id, " is disconnected!")
			p.quitCH <- true
			p.disconnectCH <- true
			return
		}
		if err != nil {
			continue
		}

		//log.Println(msg)
		// Input Controller
		//strs := strings.Split(msg, " ")
		if msg.Com == "$GO" {
			//msg.XXXZZZ = make([]float64, 2)
			p.xxx = msg.XXXZZZ[0] //strconv.ParseFloat(strs[1], 64)
			p.zzz = msg.XXXZZZ[1] //strconv.ParseFloat(strs[2], 64)
			if p.IS_GO {
				p.quitCH <- true
			}
		} else if msg.Com == "$PLANE" {
			PL := gosrc.PData{Ptype: msg.Ptype, Pcoords: msg.Pcoords, Conid: msg.Conid, Cons: msg.Conlist}
			gosrc.WRITE_PLANE_TO_DATABASE(&PL)
			continue
		} else if msg.Com == "$ENDPLANE" {
			k := rand.Intn(len(gosrc.GenIDs))
			p.planeNow = gosrc.GenIDs[k]
			tmp := gosrc.UsuPLANES[p.planeNow]
			//log.Println(k, gosrc.GenIDs[k], p.planeNow, tmp)
			p.x = (tmp.P1.X + tmp.P2.X + tmp.P3.X + tmp.P4.X) / 4
			p.z = (tmp.P1.Z + tmp.P2.Z + tmp.P3.Z + tmp.P4.Z) / 4
			msg1 := "$GENERATE " + strconv.Itoa(p.id) + " " + strconv.FormatFloat(p.x, 'f', 3, 64) + " "
			msg1 += strconv.FormatFloat(p.z, 'f', 3, 64)
			for _, pi := range p.room.ps {
				pi.outCH <- msg1
			}
			continue
		} else if msg.Com == "$PING" {
			p.outCH <- "$PONG"
			continue
		} else if msg.Com == "$READY" {
			p.server.addInRoom <- p
			continue
		}

		dirN := Coord{p.xxx - p.x, p.zzz - p.z}
		dirN.x /= dirN.Length()
		dirN.z /= dirN.Length()
		//log.Println("dirN: ", dirN)
		//log.Println("strs: ", strs)

		go func() {

			// var tmp *deque.Deque
			// (*tmp).PushBack("qwe")
			// log.Println((*tmp).PopFront())

			gamma := math.Round(count_angle_rotate(p.DIR, dirN)*10000) / 10000
			p.DIR = dirN
			p.rotY += gamma
			p.IS_GO = true
			xx := p.x
			zz := p.z
			dist := math.Sqrt(math.Pow(p.xxx-xx, 2) + math.Pow(p.zzz-zz, 2))
			deltaT := dist / V
			//log.Println(deltaT)
			//T0 := time.Now()
			//deltaTtick := time.Tick(deltaT * time.Millisecond)
			var count_ms float64 = 0
			Vx := V * (p.xxx - xx) / dist
			Vz := V * (p.zzz - zz) / dist
			//var flagbuf chan *list.List
			flagbuf := make(chan *list.List)
			//p.CheckIncs()
			go p.CountRoad(flagbuf, Vx, Vz, 10)
			//log.Println(p.bufgo1)
			flagbuf <- &p.bufgo1
			flagbuf <- &p.bufgo2
			freq := time.Tick(time.Duration(16) * time.Millisecond)
			//var triggerbuf bool = true
			//var coord Coord
			nowgobuf := &p.bufgo1
			//log.Println(nowgobuf)

			go func() {
				// SEND other players my direction "$GO [id] [k] [kk]"
				msg1 := "$GO " + strconv.Itoa(p.id) + " " + strconv.FormatFloat(p.xxx, 'f', 3, 64) + " "
				msg1 += strconv.FormatFloat(p.zzz, 'f', 3, 64) + " " + strconv.FormatFloat(p.rotY, 'f', 3, 64)
				for _, pi := range p.room.ps {
					if pi == p {
						continue
					}
					pi.outCH <- msg1
				}
			}()

			//log.Println("qweqwe")
			for count_ms <= deltaT {
				select {
				case flag := <-p.quitCH:
					if flag {
						return
					}
				case <-freq: //p.server.Tick16ms:
					coord := nowgobuf.Front()
					xx = coord.Value.(Coord).x
					zz = coord.Value.(Coord).z
					p.server.ch <- InChan{p, xx, zz}
					nowgobuf.Remove(coord)
					if nowgobuf.Front() == nil {
						if nowgobuf == &p.bufgo1 {
							flagbuf <- &p.bufgo1
							nowgobuf = &p.bufgo2
						} else {
							flagbuf <- &p.bufgo2
							nowgobuf = &p.bufgo1
						}
					}
					count_ms += 16
					// case <-p.server.Tick500ms:
					// 	go func() {
					// 		// SEND other players my direction "$GOEND [id]"
					// 		//log.Println(p.x, p.z)
					// 		msg1 := "$GO " + strconv.Itoa(p.id) + " " + strconv.FormatFloat(xx+p.vx*100, 'f', 3, 64) + " " + strconv.FormatFloat(zz+p.vy*100, 'f', 3, 64)
					// 		for _, pi := range p.room.ps {
					// 			pi.outCH <- msg1
					// 		}
					// 	}()
					//p.server.ch <- InChan{p, xx + p.vx*50, zz + p.vy*50}
				}
			}
			p.IS_GO = false
			log.Println("GOEND", p.x, p.z)
			//go func() {
			// SEND other players my direction "$GOEND [id]"
			msg1 := "$GOEND " + strconv.Itoa(p.id)
			for _, pi := range p.room.ps {
				if pi == p {
					continue
				}
				pi.outCH <- msg1
			}
			//}()
		}()
	}
}
func (p *Client) SendNewState() {
	for {
		select {
		case msg := <-p.outCH:
			//log.Println(msg)
			websocket.Message.Send(p.ws, msg)
		case <-p.disconnectCH:
			return
		}
	}
}

func MSGfromNumbers(com string, coords *map[int]Coord) string {
	msg := com
	for id, val := range *coords {
		msg += strconv.Itoa(id) + " " + strconv.FormatFloat(val.x, 'f', 3, 64) + " " + strconv.FormatFloat(val.z, 'f', 3, 64) + " "
	}
	return msg
}

// Каждые 100мс отправлять клиенту предсказанные точки на 100мс вперед
// Это начинается когда игрок присылает комманду GO (x y)
//
func Rooming(server *Server, room *Room) {

	//var coords = make(map[int]Coord)

	for {
		select {
		case res := <-server.ch:
			// Change game State
			res.p.x = math.Round(res.x*1000) / 1000
			res.p.z = math.Round(res.y*1000) / 1000
			// for _, p := range room.ps {
			// 	coords[p.id] = Coord{p.x, p.z}
			// }
			// log.Println(coords)
			//msg1 := MSGfromNumbers("GO ", &coords)
			//log.Println(msg1)
			// for _, p := range room.ps {
			// 	p.outCH <- msg1
			// }
		case c := <-server.addInRoom:
			//log.Println(c)
			c.x = 0 // -124
			c.z = 0 // 144
			//c.xxx = c.x
			//c.zzz = c.z + 1
			msg1 := "$ID " + strconv.Itoa(maxId) + " " + strconv.FormatFloat(c.x, 'f', 3, 64) + " " + strconv.FormatFloat(c.z, 'f', 3, 64) + " " + strconv.FormatFloat(c.rotY, 'f', 3, 64)
			c.outCH <- msg1
			// SEND all players's "$NEWPS [id] [x] [y] [k] [kk]" to new player
			for _, p := range room.ps {
				if p.IS_GO {
					msg1 = "$NEWPSGO " + strconv.Itoa(p.id) + " " + strconv.FormatFloat(p.x, 'f', 3, 64) + " " + strconv.FormatFloat(p.z, 'f', 3, 64)
					msg1 += " " + strconv.FormatFloat(p.xxx, 'f', 3, 64) + " " + strconv.FormatFloat(p.zzz, 'f', 3, 64) + " " + strconv.FormatFloat(p.rotY, 'f', 3, 64)
				} else {
					msg1 = "$NEWPS " + strconv.Itoa(p.id) + " " + strconv.FormatFloat(p.x, 'f', 3, 64) + " " + strconv.FormatFloat(p.z, 'f', 3, 64) + " " + strconv.FormatFloat(p.rotY, 'f', 3, 64)
				}
				time.Sleep(5 * time.Millisecond)
				c.outCH <- msg1
			}
			// SEND new player's "$NEWP [id] [x] [y]" to all players
			msg1 = "$NEWP " + strconv.Itoa(c.id) + " " + strconv.FormatFloat(c.x, 'f', 3, 64) + " " + strconv.FormatFloat(c.z, 'f', 3, 64)
			for _, p := range room.ps {
				p.outCH <- msg1
			}
			// TODO: async
			room.ps = append(room.ps, c)
		}
	}
}
