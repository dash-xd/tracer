package main

import (
        "crypto/rand"
        "encoding/hex"
        "encoding/json"
        "fmt"
        "log"
        "time"
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
        Traces      map[string][]*Span
}

func NewTracer(serviceName string) *Tracer {
        return &Tracer{
                ServiceName: serviceName,
                Traces:      make(map[string][]*Span),
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

func (t *Tracer) StartSpan(name string, parentSpanID *string) *Span {
        var traceID string
        if parentSpanID != nil {
                traceID = t.Traces[*parentSpanID][0].TraceID
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

        if _, ok := t.Traces[traceID]; !ok {
                t.Traces[traceID] = []*Span{}
        }

        t.Traces[traceID] = append(t.Traces[traceID], span)
        return span
}

func (t *Tracer) EndSpan(span *Span, status string, attributes map[string]string) {
        endTime := time.Now()
        span.EndTime = &endTime
        span.Status = status
        for k, v := range attributes {
                span.Attributes[k] = v
        }
}

func (t *Tracer) GetTrace(traceID string) []*Span {
        return t.Traces[traceID]
}

func (t *Tracer) ExportTraces() {
        fmt.Println("Exporting traces...")
        jsonData, err := json.MarshalIndent(t.Traces, "", "  ")
        if err != nil {
                log.Fatalf("Error marshaling traces: %v", err)
        }
        fmt.Println(string(jsonData))
}
