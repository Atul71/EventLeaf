package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Atul71/EventLeaf/api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type fakeVenueRepoFull struct {
	createFn func(ctx context.Context, req *models.CreateVenueRequest) (*models.Venue, error)
	getFn    func(ctx context.Context, id uuid.UUID) (*models.Venue, error)
	listFn   func(ctx context.Context, limit, offset int) ([]models.Venue, error)
	updateFn func(ctx context.Context, id uuid.UUID, req *models.UpdateVenueRequest) (*models.Venue, error)
	deleteFn func(ctx context.Context, id uuid.UUID) error
}

func (f *fakeVenueRepoFull) Create(ctx context.Context, req *models.CreateVenueRequest) (*models.Venue, error) {
	if f.createFn != nil {
		return f.createFn(ctx, req)
	}
	return nil, nil
}
func (f *fakeVenueRepoFull) GetByID(ctx context.Context, id uuid.UUID) (*models.Venue, error) {
	if f.getFn != nil {
		return f.getFn(ctx, id)
	}
	return nil, pgx.ErrNoRows
}
func (f *fakeVenueRepoFull) List(ctx context.Context, limit, offset int) ([]models.Venue, error) {
	if f.listFn != nil {
		return f.listFn(ctx, limit, offset)
	}
	return nil, nil
}
func (f *fakeVenueRepoFull) Update(ctx context.Context, id uuid.UUID, req *models.UpdateVenueRequest) (*models.Venue, error) {
	if f.updateFn != nil {
		return f.updateFn(ctx, id, req)
	}
	return nil, nil
}
func (f *fakeVenueRepoFull) Delete(ctx context.Context, id uuid.UUID) error {
	if f.deleteFn != nil {
		return f.deleteFn(ctx, id)
	}
	return nil
}

func TestCreateVenue_BadJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/venues", bytes.NewBufferString(`{`))
	c.Request.Header.Set("Content-Type", "application/json")
	h.CreateVenue(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("code %d", w.Code)
	}
}

func TestGetVenue_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/venues/x", nil)
	c.Params = gin.Params{{Key: "id", Value: "bad"}}
	h.GetVenue(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("code %d", w.Code)
	}
}

func TestGetVenue_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{
		getFn: func(ctx context.Context, id uuid.UUID) (*models.Venue, error) {
			return nil, pgx.ErrNoRows
		},
	})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	id := uuid.New()
	c.Request = httptest.NewRequest(http.MethodGet, "/venues/"+id.String(), nil)
	c.Params = gin.Params{{Key: "id", Value: id.String()}}
	h.GetVenue(c)
	if w.Code != http.StatusNotFound {
		t.Fatalf("code %d", w.Code)
	}
}

func TestListVenues_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{
		listFn: func(ctx context.Context, limit, offset int) ([]models.Venue, error) {
			return []models.Venue{{Name: "Hall"}}, nil
		},
	})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/venues", nil)
	h.ListVenues(c)
	if w.Code != http.StatusOK {
		t.Fatalf("code %d", w.Code)
	}
}

func TestUpdateVenue_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPut, "/venues/x", bytes.NewBufferString(`{}`))
	c.Params = gin.Params{{Key: "id", Value: "bad"}}
	c.Request.Header.Set("Content-Type", "application/json")
	h.UpdateVenue(c)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("code %d", w.Code)
	}
}

func TestDeleteVenue_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{
		deleteFn: func(ctx context.Context, id uuid.UUID) error {
			return errVenueNotFound
		},
	})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	id := uuid.New()
	c.Request = httptest.NewRequest(http.MethodDelete, "/venues/"+id.String(), nil)
	c.Params = gin.Params{{Key: "id", Value: id.String()}}
	h.DeleteVenue(c)
	if w.Code != http.StatusNotFound {
		t.Fatalf("code %d", w.Code)
	}
}

// errVenueNotFound matches repository.Delete error string for 404 branch.
var errVenueNotFound = errString("venue not found")

type errString string

func (e errString) Error() string { return string(e) }

func TestDeleteVenue_NoContent(t *testing.T) {
	gin.SetMode(gin.TestMode)
	h := NewVenueHandler(&fakeVenueRepoFull{
		deleteFn: func(ctx context.Context, id uuid.UUID) error {
			return nil
		},
	})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	id := uuid.New()
	c.Request = httptest.NewRequest(http.MethodDelete, "/venues/"+id.String(), nil)
	c.Params = gin.Params{{Key: "id", Value: id.String()}}
	h.DeleteVenue(c)
	if w.Code != http.StatusNoContent {
		t.Fatalf("code %d", w.Code)
	}
}

func TestGetVenue_OK(t *testing.T) {
	gin.SetMode(gin.TestMode)
	id := uuid.New()
	h := NewVenueHandler(&fakeVenueRepoFull{
		getFn: func(ctx context.Context, vid uuid.UUID) (*models.Venue, error) {
			return &models.Venue{ID: id, Name: "V", Address: "a", City: "c", Country: "USA"}, nil
		},
	})
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodGet, "/venues/"+id.String(), nil)
	c.Params = gin.Params{{Key: "id", Value: id.String()}}
	h.GetVenue(c)
	if w.Code != http.StatusOK {
		t.Fatalf("code %d", w.Code)
	}
	var v models.Venue
	if err := json.Unmarshal(w.Body.Bytes(), &v); err != nil || v.Name != "V" {
		t.Fatalf("body %s err %v", w.Body.String(), err)
	}
}
