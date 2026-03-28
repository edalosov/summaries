from flask import Blueprint, request, jsonify
from database import save_summary, get_history, get_summary, delete_summary
from summarizer import generate_summary

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    if not data or not data.get('text') or len(data['text'].strip()) < 50:
        return jsonify({'error': 'Text is required and must be at least 50 characters.'}), 400

    text = data['text'].strip()
    content_type = data.get('content_type', 'general')

    try:
        summary = generate_summary(text, content_type)
    except Exception as e:
        return jsonify({'error': f'Summarization failed: {str(e)}'}), 502

    record = save_summary(text, content_type, summary)

    return jsonify({
        'id': record['id'],
        'summary': summary,
        'created_at': record['created_at'],
    })


@api.route('/history', methods=['GET'])
def history_list():
    return jsonify({'summaries': get_history()})


@api.route('/history/<int:summary_id>', methods=['GET'])
def history_detail(summary_id):
    record = get_summary(summary_id)
    if record is None:
        return jsonify({'error': 'Summary not found.'}), 404
    return jsonify(record)


@api.route('/history/<int:summary_id>', methods=['DELETE'])
def history_delete(summary_id):
    delete_summary(summary_id)
    return '', 204
