// Support multiple roadmap panes (tabs). Render the same ordered roadmap into each pane.
// Ordered topics (you can change this order based on difficulty/priority)
const topicOrder = [
  "Array", "String", "Hash Table", "Two Pointers", "Sliding Window",
  "Stack", "Queue", "Linked List", "Tree", "Binary Search", "Heap",
  "Graph", "Greedy", "Dynamic Programming", "Backtracking", "Trie"
];

const uniqueTopics = new Set();

// Utility: clear a container
function clearContainer(el){ while(el.firstChild) el.removeChild(el.firstChild); }

// Render function for one container
function renderInto(container, topicsToRender){
  clearContainer(container);
  topicsToRender.forEach((topic, idx) => {
    const step = document.createElement("div");
    step.className = "journey-step";
    step.textContent = topic;
    step.onclick = () => { window.location.href = `topic-roadmap.html?topic=${encodeURIComponent(topic)}`; };
    container.appendChild(step);

    if (idx !== topicsToRender.length - 1){
      const line = document.createElement("div");
      line.className = "line";
      container.appendChild(line);
    }
  });
}

// Tabs: wire up tab buttons
function initTabs(){
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.roadmap-pane');
  // restore last tab
  const last = localStorage.getItem('roadmapLastTab') || 'basic';
  tabs.forEach(t => t.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));
  const activeBtn = Array.from(tabs).find(b => b.dataset.target === last) || tabs[0];
  if(activeBtn) activeBtn.classList.add('active');
  const activePane = Array.from(panes).find(p => p.dataset.key === last) || panes[0];
  if(activePane) activePane.classList.add('active');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      tabs.forEach(t => t.classList.toggle('active', t===btn));
      panes.forEach(p => p.classList.toggle('active', p.dataset.key === target));
      localStorage.setItem('roadmapLastTab', target);
    });
  });
}

fetch("data/raw_data.json")
  .then(res => res.json())
  .then(data => {
    data.forEach(item => {
      if (item["Frequency (Number of Companies)"] >= 5) {
        const topics = item["Topics"].split(",").map(t => t.trim());
        topics.forEach(t => uniqueTopics.add(t));
      }
    });

    // Filter topicOrder by what exists in the dataset
    const topicsToRender = topicOrder.filter(t => uniqueTopics.has(t));

    // Curated per-tab roadmap content
    const pythonTopics = [
      "Python Fundamentals (syntax, data types, operators)",
      "Control Flow (if, loops, comprehensions)",
      "Functions & Modules (args, kwargs, packages)",
      "Object-Oriented Programming (classes, inheritance)",
      "File I/O & Serialization (json, csv, pickle)",
      "Standard Library Essentials (itertools, functools, datetime)",
      "Virtual Environments & Packaging (venv, pip, pyproject)",
      "Testing & Quality (unittest/pytest, linters, type hints)",
      "Debugging & Logging (pdb, logging)",
      "Async Python (asyncio, async/await)",
      "Web Frameworks (Flask, Django, FastAPI)",
      "Data Tools (NumPy, pandas, matplotlib) — optional for DS",
      "Databases & ORMs (SQL, SQLite, SQLAlchemy)",
      "Concurrency (threading, multiprocessing)",
      "Deployment & DevOps (Docker, CI/CD basics)",
      "Performance (profiling, Cython, optimizations)",
      "Best Practices (PEP8, packaging, semantic versioning)"
    ];

    const frontendTopics = [
      "HTML & Semantics (structure, accessibility)",
      "CSS Fundamentals (box model, layout, specificity)",
      "Responsive Design (media queries, mobile-first)",
      "Modern CSS (Flexbox, Grid, custom properties)",
      "Browser DevTools & Debugging",
      "JavaScript Essentials (ES6+, closures, scope)",
      "DOM Manipulation & Events",
      "TypeScript Basics (types, interfaces) — optional but recommended",
      "Build Tools (npm, bundlers: Vite, Webpack)",
      "Frameworks/Libraries (React, Vue, Svelte) — pick one to specialize",
      "State Management (Redux, Zustand, Pinia, context)",
      "Routing & SPA Concepts",
      "Accessibility (a11y practices, ARIA)",
      "Testing (Jest, Testing Library, end-to-end)",
      "Performance Optimization (lazy loading, code-splitting)",
      "Progressive Web Apps (service workers, offline)",
      "CSS Architecture (BEM, utility-first, component styles)",
      "Security Basics (CSP, XSS protections)",
      "Deployment & CI (Netlify, Vercel, GitHub Actions)"
    ];

    const backendTopics = [
      "HTTP & REST Principles (methods, status codes, headers)",
      "APIs Design (REST, versioning, rate limiting)",
      "Authentication & Authorization (JWT, OAuth, sessions)",
      "Databases (SQL fundamentals, Joins, transactions)",
      "NoSQL Databases (MongoDB, Redis use-cases)",
      "Caching (Redis, CDN strategies)",
      "Message Queues & Streaming (RabbitMQ, Kafka)",
      "Microservices Basics (service boundaries, communication)",
      "Inter-service Communication (HTTP, gRPC)",
      "Containerization (Docker) & Orchestration (Kubernetes)",
      "Data Modeling & Indexing",
      "Concurrency & Scaling (horizontal vs vertical)",
      "Testing (unit, integration, contract tests)",
      "CI/CD Pipelines & Automation",
      "Observability (logging, metrics, tracing - Prometheus, Jaeger)",
      "Security Best Practices (input validation, secrets management)",
      "Storage, Backups & Migrations",
      "Performance Tuning & Profiling",
      "Infrastructure as Code (Terraform, CloudFormation)",
      "Deployment Strategies (blue/green, canary)"
    ];

    const cppTopics = [
      "C++ Fundamentals (syntax, data types, compilation model)",
      "Memory Management (stack vs heap, new/delete, RAII)",
      "Object-Oriented Programming (classes, inheritance, polymorphism)",
      "Modern C++ (RAII, smart pointers, move semantics)",
      "STL Containers & Algorithms (vector, map, set, algorithms)",
      "Templates & Generic Programming (function/class templates)",
      "Concurrency (std::thread, mutex, atomics)",
      "Resource Management (unique_ptr, shared_ptr, custom deleters)",
      "Performance & Profiling (cache, inlining, optimization flags)",
      "Build Systems (CMake, Makefiles)",
      "Debugging Tools (gdb, lldb) & Sanitizers (ASAN, UBSAN)",
      "Undefined Behavior & Safety Practices",
      "Interfacing with C & ABI considerations",
      "Networking Basics (sockets) — optional",
      "Testing (GoogleTest, unit/integration testing)",
      "Packaging & Deployment (static/dynamic linking)",
      "Advanced Topics (metaprogramming, expression templates)",
      "Tooling (clang-format, clang-tidy) and CI integration"
    ];

    const javaTopics = [
      "Java Basics (syntax, types, JVM concepts)",
      "Object-Oriented Design (classes, interfaces, inheritance)",
      "Collections Framework (List, Set, Map, Queue)",
      "Generics & Type Safety",
      "Exception Handling and Best Practices",
      "Java 8+ Features (streams, lambdas, Optional)",
      "Concurrency (threads, executors, synchronization, concurrent collections)",
      "JVM Internals & Memory (heap, GC tuning)",
      "Build Tools (Maven, Gradle)",
      "Testing (JUnit, Mockito, integration tests)",
      "Persistence (JPA/Hibernate, JDBC)",
      "Frameworks (Spring Boot, Spring MVC, Spring Data)",
      "REST API Design (Spring REST controllers, validation)",
      "Microservices Patterns (Spring Cloud, service discovery)",
      "Security (Spring Security, OAuth, JWT)",
      "Observability (logging, metrics with Micrometer)",
      "Containerization & Deployment (Docker, Kubernetes)",
      "Performance Tuning & Profiling (JVM profilers, async tuning)",
      "Reactive Programming (Project Reactor, WebFlux) — optional",
      "Best Practices (code style, SOLID, dependency management)"
    ];

    // Find all journey containers and render into them. If the container belongs to the
    // python pane, render the curated python roadmap, otherwise render the generic topics.
    const containers = document.querySelectorAll('.journey-container');
    containers.forEach(c => {
      const pane = c.closest('.roadmap-pane');
      const key = pane && pane.dataset && pane.dataset.key ? pane.dataset.key : 'basic';
      if(key === 'python'){
        renderInto(c, pythonTopics);
      } else if (key === 'frontend'){
        renderInto(c, frontendTopics);
      } else if (key === 'backend'){
        renderInto(c, backendTopics);
      } else if (key === 'cpp'){
        renderInto(c, cppTopics);
      } else if (key === 'java'){
        renderInto(c, javaTopics);
      } else {
        renderInto(c, topicsToRender);
      }
    });

    // Custom roadmaps: load and render list + wire create form
    function loadCustomRoadmaps(){
      try{
        const raw = localStorage.getItem('customRoadmaps');
        return raw ? JSON.parse(raw) : [];
      }catch(e){ return []; }
    }
    function saveCustomRoadmaps(list){
      localStorage.setItem('customRoadmaps', JSON.stringify(list));
    }

    function renderCustomList(){
      const listEl = document.getElementById('custom-list');
      const previewEl = document.getElementById('custom-preview');
      if(!listEl) return;
      listEl.innerHTML = '';
      const items = loadCustomRoadmaps();
      if(items.length === 0){
        const p = document.createElement('p'); p.textContent = 'No custom roadmaps yet. Create one below.'; listEl.appendChild(p);
        previewEl.innerHTML = '';
        return;
      }
      items.forEach((rm, idx) => {
        const wrapper = document.createElement('div'); wrapper.style.display='flex'; wrapper.style.justifyContent='space-between'; wrapper.style.alignItems='center';
        const left = document.createElement('div');
        // compute progress summary
        const progress = loadTopicProgress();
        const rmProg = progress[rm.id] || {};
        let completed = 0, inprog = 0;
        Object.values(rmProg).forEach(s => { if(s === 'completed') completed++; else if (s === 'in-progress') inprog++; });
        left.innerHTML = `<strong>${rm.name}</strong> <div style="font-size:12px;color:#666">${rm.items.length} items · ${new Date(rm.createdAt).toLocaleString()} · <span style='color:#27ae60'>${completed} completed</span> · <span style='color:#f39c12'>${inprog} in progress</span></div>`;
        const actions = document.createElement('div');
        const openBtn = document.createElement('button'); openBtn.className='tab-btn'; openBtn.textContent='Open'; openBtn.style.marginRight='8px';
        openBtn.addEventListener('click', ()=> renderCustomRoadmap(rm));
        const delBtn = document.createElement('button'); delBtn.className='tab-btn'; delBtn.textContent='Delete'; delBtn.style.background='#e74c3c'; delBtn.style.color='#fff';
        delBtn.addEventListener('click', ()=>{
          if(!confirm(`Delete roadmap "${rm.name}"?`)) return;
          items.splice(idx,1); saveCustomRoadmaps(items); renderCustomList();
        });
        actions.appendChild(openBtn); actions.appendChild(delBtn);
        wrapper.appendChild(left); wrapper.appendChild(actions);
        listEl.appendChild(wrapper);
      });
    }

    function renderCustomRoadmap(rm){
      const previewEl = document.getElementById('custom-preview');
      if(!previewEl) return;
      previewEl.innerHTML = '';
      const title = document.createElement('h4'); title.textContent = rm.name; previewEl.appendChild(title);
      const container = document.createElement('div'); container.className = 'journey-container';
      previewEl.appendChild(container);

      // Render items with progress badges for custom roadmap
      const progress = loadTopicProgress();
      const rmProgress = progress[rm.id] || {};
      // clear container
      container.innerHTML = '';
      rm.items.forEach((it, idx) => {
        const step = document.createElement('div');
        step.className = 'journey-step';
        step.style.display = 'flex';
        step.style.justifyContent = 'space-between';
        step.style.alignItems = 'center';

        const left = document.createElement('div');
        left.textContent = it;

        const right = document.createElement('div');
        right.style.display = 'flex';
        right.style.alignItems = 'center';
        right.style.gap = '8px';

        const status = rmProgress[idx] || 'not-started';
        const badge = document.createElement('button');
        badge.className = 'tab-btn';
        badge.style.padding = '6px 10px';
        badge.style.borderRadius = '999px';
        badge.style.minWidth = '110px';
        updateBadgeStyle(badge, status);
        badge.title = 'Click to cycle status';
        badge.addEventListener('click', ()=>{
          const newStatus = cycleStatus(status);
          // update local status var and persist
          rmProgress[idx] = newStatus;
          progress[rm.id] = rmProgress;
          saveTopicProgress(progress);
          updateBadgeStyle(badge, newStatus);
          // update current status variable to newStatus for next cycle capture
          status = newStatus; // eslint-disable-line no-labels
          // re-render list summary if present
          renderCustomList();
        });

        right.appendChild(badge);
        step.appendChild(left);
        step.appendChild(right);
        container.appendChild(step);

        // add connector if not last
        if (idx !== rm.items.length - 1){
          const line = document.createElement('div');
          line.className = 'line';
          container.appendChild(line);
        }
      });
    }

    // topicProgress helpers: { [roadmapId]: { [itemIndex]: status } }
    function loadTopicProgress(){
      try{ const raw = localStorage.getItem('topicProgress'); return raw ? JSON.parse(raw) : {}; }catch(e){ return {}; }
    }
    function saveTopicProgress(obj){
      try{ localStorage.setItem('topicProgress', JSON.stringify(obj)); }catch(e){ console.warn('Failed to save topicProgress', e); }
    }
    function cycleStatus(current){
      if(current === 'not-started') return 'in-progress';
      if(current === 'in-progress') return 'completed';
      return 'not-started';
    }
    function updateBadgeStyle(badge, status){
      badge.textContent = (status === 'not-started' ? 'Not started' : (status === 'in-progress' ? 'In progress' : 'Completed'));
      if(status === 'not-started'){
        badge.style.background = '#fff'; badge.style.color='#333'; badge.style.border='1px solid #ccc';
      } else if (status === 'in-progress'){
        badge.style.background = '#f39c12'; badge.style.color='#fff'; badge.style.border='1px solid #f39c12';
      } else {
        badge.style.background = '#27ae60'; badge.style.color='#fff'; badge.style.border='1px solid #27ae60';
      }
    }

    // wire create form
    const createForm = document.getElementById('create-custom-form');
    if(createForm){
      createForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const name = document.getElementById('custom-name').value.trim();
        const itemsText = document.getElementById('custom-items').value.trim();
        if(!name || !itemsText){ alert('Please provide a name and at least one item.'); return; }
        const items = itemsText.split('\n').map(s=>s.trim()).filter(Boolean);
        const list = loadCustomRoadmaps();
        const newRm = { id: Date.now().toString(), name, items, createdAt: Date.now() };
        list.unshift(newRm); saveCustomRoadmaps(list);
        document.getElementById('custom-name').value=''; document.getElementById('custom-items').value='';
        renderCustomList(); renderCustomRoadmap(newRm);
      });
    }

    // initial render of custom list
    renderCustomList();

    initTabs();
  })
  .catch(err => {
    console.error("Failed to build journey map:", err);
    const containers = document.querySelectorAll('.journey-container');
    containers.forEach(c => { c.innerHTML = "<p>Could not load roadmap. Try again later.</p>"; });
  });
