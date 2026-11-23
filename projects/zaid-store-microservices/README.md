# Store Microservices on Docker and Kubernetes

A runnable two-service deployment sample. The catalog owns product reads; the orders API validates input, calls catalog over HTTP with a timeout, checks available stock, and returns an order snapshot. Docker Compose wires the services and waits for health. Kubernetes manifests add multiple replicas, resource bounds, non-root/read-only containers, probes, and stable service discovery.

## Run with Docker Compose

Requirements: Docker Desktop with Compose and Node 20 (only needed to call the sample endpoint).

```sh
docker compose up --build
```

Catalog is internal to the Compose network. Orders is available at `http://localhost:4102`. Create a sample order:

```sh
curl -X POST http://localhost:4102/orders -H 'Content-Type: application/json' -d '{"productId":"p-101","quantity":2}'
```

The returned order is in-memory for demo purposes and is lost when the service restarts. This sample focuses on service boundaries and orchestration; it does not claim durable storage, distributed stock reservation, authentication, or payment processing.

## Run on Kubernetes

Build images where the cluster can pull them, or load them into a local cluster first:

```sh
docker build -t zaid-catalog:latest services/catalog
docker build -t zaid-orders:latest services/orders
kubectl apply -f k8s/
kubectl -n zaid-store rollout status deployment/catalog
kubectl -n zaid-store rollout status deployment/orders
kubectl -n zaid-store port-forward service/orders 4102:4102
```

Then send the Compose example request to `http://localhost:4102/orders`. For a local kind cluster, run `kind load docker-image zaid-catalog:latest zaid-orders:latest` before applying. For a remote cluster, push versioned images to an authenticated registry and replace the image references. The sample exposes orders through a NodePort for local learning; use an ingress or internal LoadBalancer with TLS and network policies for a real environment.

## Jenkins integration

The companion pipeline in `projects/jenkins-cicd/Jenkinsfile` documents the CI/CD stages. Production image publishing/deployment should be configured with scoped Jenkins credentials and an explicit protected environment.
