package tracer

import (
        "context"
        "crypto/rand"
        "encoding/hex"
        "fmt"
        "log"
        "time"

        "github.com/dash-xd/gospace/internal/axiomlogger"
)

type Span struct {
        TraceID      string            `json:"traceId"`
        SpanID       string            `json:"spanId"`
        ParentSpanID string            `json:"parentSpanId,omitempty"`
        Name         string            `json:"name"`
        StartTime    time.Time         `json:"startTime"`
        EndTime      *time.Time        `json:"endTime,omitempty"`
        Attributes   map[string]string `json:"attributes"`
        Status       string            `json:"status"`
}

type Tracer struct {
        ServiceName string
        Logger      *axiomlogger.Logger
}

func NewTracer(serviceName string, logger *axiomlogger.Logger) *Tracer {
        return &Tracer{
                ServiceName: serviceName,
                Logger:      logger,
        }
}

func (t *Tracer) generateSecureID() string {
        b := make([]byte, 16)
        _, err := rand.Read(b)
        if err != nil {
                log.Fatalf("Error generating random bytes: %v", err)
        }
        return hex.EncodeToString(b)
}

func (t *Tracer) StartSpan(ctx context.Context, name string) (context.Context, *Span) {
        var parentSpanID *string
        if parentSpan, ok := ctx.Value("span").(*Span); ok {
                parentSpanIDPtr := parentSpan.SpanID
                parentSpanID = &parentSpanIDPtr
        }

        traceID := ""
        if parentSpanID != nil {
                traceID = ctx.Value("traceID").(string)
        } else {
                traceID = t.generateSecureID()
        }

        spanID := t.generateSecureID()
        startTime := time.Now()

        span := &Span{
                TraceID:      traceID,
                SpanID:       spanID,
                ParentSpanID: "",
                Name:         name,
                StartTime:    startTime,
                Attributes:   make(map[string]string),
                Status:       "UNSET",
        }

        if parentSpanID != nil {
                span.ParentSpanID = *parentSpanID
        }

        newCtx := context.WithValue(ctx, "span", span)
        newCtx = context.WithValue(newCtx, "traceID", traceID)

        return newCtx, span
}

func (t *Tracer) EndSpan(ctx context.Context, span *Span, status string, attributes map[string]string) {
        endTime := time.Now()
        span.EndTime = &endTime
        span.Status = status
        for k, v := range attributes {
                span.Attributes[k] = v
        }

        data := map[string]interface{}{
                "traceId":      span.TraceID,
                "spanId":       span.SpanID,
                "parentSpanId": span.ParentSpanID,
                "name":         span.Name,
                "startTime":    span.StartTime,
                "endTime":      span.EndTime,
                "attributes":   span.Attributes,
                "status":       span.Status,
        }
        if err := t.Logger.LogData(data); err != nil {
                log.Printf("Error logging to Axiom: %v", err)
        }
}
