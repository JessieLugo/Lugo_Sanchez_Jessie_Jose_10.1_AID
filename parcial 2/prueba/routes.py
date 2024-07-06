from flask import render_template, request, jsonify
from flask_socketio import emit
import os
import subprocess

PLAYBOOKS_DIR = 'playbooks'

def register_routes(app, socketio):

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/create-playbook')
    def create_playbook():
        return render_template('create-playbook.html')

    @app.route('/add-host', methods=['POST'])
    def add_host():
        data = request.json
        new_host = data['new_host']
        group = data['group']
        with open('hosts.ini', 'a') as f:
            f.write(f'\n{group}\n{new_host} ansible_host={new_host}')
        return jsonify({'status': 'success'})

    @app.route('/get-hosts')
    def get_hosts():
        hosts = []
        with open('hosts.ini', 'r') as f:
            lines = f.readlines()
            for line in lines:
                if line.strip() and not line.startswith('['):
                    hosts.append(line.split()[0])
        return jsonify({'hosts': hosts})

    @app.route('/run-playbook', methods=['POST'])
    def run_playbook():
        data = request.json
        playbook = data['playbook']
        hosts = data['hosts']
        command = ['ansible-playbook', os.path.join(PLAYBOOKS_DIR, playbook), '-i', 'hosts.ini', '--limit', ','.join(hosts)]
        
        # Ejecutar el playbook y emitir los logs en tiempo real
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        for line in iter(process.stdout.readline, b''):
            socketio.emit('playbook_log', {'data': line.decode('utf-8')}, broadcast=True)
        
        process.stdout.close()
        process.stderr.close()
        process.wait()
        
        return jsonify({'status': 'success', 'message': f'Playbook {playbook} ejecutado en hosts: {", ".join(hosts)}'})

    @app.route('/api/playbooks', methods=['GET'])
    def get_playbooks():
        playbooks = [f for f in os.listdir(PLAYBOOKS_DIR) if f.endswith('.yml')]
        return jsonify({'playbooks': playbooks})

    @app.route('/api/playbook_content', methods=['GET'])
    def get_playbook_content():
        playbook = request.args.get('name')
        if playbook:
            with open(os.path.join(PLAYBOOKS_DIR, playbook), 'r') as f:
                content = f.read()
            return jsonify({"name": playbook, "content": content})
        return jsonify({"error": "Playbook no encontrado"}), 404

    @app.route('/api/save_playbook', methods=['POST'])
    def save_playbook():
        data = request.json
        playbook_name = data.get('name')
        playbook_content = data.get('content')
        if not playbook_name or not playbook_content:
            return jsonify({"error": "Datos inválidos"}), 400
        playbook_path = os.path.join(PLAYBOOKS_DIR, playbook_name + '.yml')
        with open(playbook_path, 'w') as f:
            f.write(playbook_content)
        return jsonify({"status": "success", "message": "Playbook guardado exitosamente", "playbook": playbook_name})

