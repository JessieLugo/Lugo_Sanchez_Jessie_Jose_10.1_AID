document.addEventListener('DOMContentLoaded', function() {
    loadPlaybooks();
    loadHosts();
    loadExistingPlaybooks();
    document.getElementById('add-host-form').addEventListener('submit', addHost);
    document.getElementById('create-playbook-form').addEventListener('submit', savePlaybook);
});

function loadPlaybooks() {
    const playbookList = document.getElementById('playbook-list');
    const playbooks = ['playbook1.yml', 'playbook2.yml']; // Ejemplo, reemplazar con datos reales
    playbooks.forEach(playbook => {
        let option = document.createElement('option');
        option.value = playbook;
        option.textContent = playbook;
        playbookList.appendChild(option);
    });
}

function loadHosts() {
    fetch('/get-hosts')
        .then(response => response.json())
        .then(data => {
            const hostList = document.getElementById('host-list');
            data.hosts.forEach(host => {
                let checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = host;
                checkbox.value = host;
                let label = document.createElement('label');
                label.htmlFor = host;
                label.textContent = host;
                hostList.appendChild(checkbox);
                hostList.appendChild(label);
            });
        });
}

function loadExistingPlaybooks() {
    fetch('/get-playbooks')
        .then(response => response.json())
        .then(data => {
            const playbookSelect = document.getElementById('existing-playbooks');
            data.playbooks.forEach(playbook => {
                let option = document.createElement('option');
                option.value = playbook;
                option.textContent = playbook;
                playbookSelect.appendChild(option);
            });
        });
}

function loadPlaybookContent() {
    const playbookSelect = document.getElementById('existing-playbooks');
    const playbook = playbookSelect.value;
    if (playbook) {
        fetch(`/get-playbook-content?playbook=${playbook}`)
            .then(response => response.text())
            .then(data => {
                document.getElementById('playbook-content').value = data;
            });
    } else {
        document.getElementById('playbook-content').value = '';
    }
}

function addHost(event) {
    event.preventDefault();
    const newHost = document.getElementById('new-host').value;
    const group = 'webservers'; // Ejemplo, puedes hacerlo dinámico si es necesario
    fetch('/add-host', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_host: newHost, group: group }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = newHost;
            checkbox.value = newHost;
            let label = document.createElement('label');
            label.htmlFor = newHost;
            label.textContent = newHost;
            document.getElementById('host-list').appendChild(checkbox);
            document.getElementById('host-list').appendChild(label);
            document.getElementById('new-host').value = '';
        }
    });
}

function startPlaybook() {
    const playbook = document.getElementById('playbook-list').value;
    const selectedHosts = Array.from(document.querySelectorAll('#host-list input:checked')).map(cb => cb.value);
    fetch('/run-playbook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playbook: playbook, hosts: selectedHosts }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    });
}

function savePlaybook(event) {
    event.preventDefault();
    const playbookContent = document.getElementById('playbook-content').value;
    const playbookSelect = document.getElementById('existing-playbooks');
    const playbook = playbookSelect.value || 'nuevo_playbook.yml';
    fetch('/save-playbook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playbook: playbook, content: playbookContent }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Playbook guardado:', data);
        if (!playbookSelect.value) {
            let option = document.createElement('option');
            option.value = data.playbook;
            option.textContent = data.playbook;
            playbookSelect.appendChild(option);
            playbookSelect.value = data.playbook;
        }
    });
}

function createPlaybook(event) {
    event.preventDefault();
    const playbookContent = document.getElementById('playbook-content').value;
    if (playbookContent) {
        console.log('Nuevo playbook creado:', playbookContent);
    }
}

